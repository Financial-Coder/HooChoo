import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { Role } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) { }

  async findAll(query: QueryPostsDto, userId?: string) {
    const limit = query.limit ?? 10;

    const where: any = {
      isPublished: true,
      deletedAt: null,
    };

    if (query.type) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where.type = query.type;
    }

    if (query.year) {
      const startDate = new Date(query.year, 0, 1);
      const endDate = new Date(query.year + 1, 0, 1);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where.createdAt = {
        gte: startDate,
        lt: endDate,
      };
    }

    if (query.cursor) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where.id = {
        lt: query.cursor,
      };
    }

    const posts = await this.prisma.post.findMany({
      where,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        media: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        ...(userId && {
          likes: {
            where: { userId },
            select: { id: true },
          },
        }),
      },
    });

    const hasNext = posts.length > limit;
    const postsWithLikeStatus = hasNext ? posts.slice(0, limit) : posts;

    // isLikedByMe 필드 추가
    const data = postsWithLikeStatus.map((post) => ({
      ...post,
      isLikedByMe: userId ? post.likes?.length > 0 : false,
      likes: undefined, // likes 배열은 제거
    }));

    const nextCursor = hasNext ? data[data.length - 1].id : null;

    return {
      data,
      nextCursor,
    };
  }

  async findOne(id: string, userId?: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        media: true,
        comments: {
          where: {
            deletedAt: null,
          },
          orderBy: { createdAt: 'asc' },
          take: 20,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('포스트를 찾을 수 없습니다.');
    }

    if (!post.isPublished && post.authorId !== userId) {
      throw new ForbiddenException('이 포스트에 접근할 수 없습니다.');
    }

    return post;
  }

  async create(dto: CreatePostDto, file: Express.Multer.File, authorId: string) {
    // 파일 저장 및 썸네일 생성
    const fileData = await this.storageService.saveFile(file, dto.type);

    // MediaAsset 생성
    const mediaAsset = await this.prisma.mediaAsset.create({
      data: {
        originalUrl: fileData.originalUrl,
        thumbnailUrl: fileData.thumbnailUrl,
        width: fileData.width,
        height: fileData.height,
        byteSize: file.size, // Number로 저장 (BigInt는 JSON 직렬화 불가)
        status: 'READY',
        storageProvider: 'AWS_S3', // 추후 변경 가능
      },
    });

    // Post 생성
    const post = await this.prisma.post.create({
      data: {
        type: dto.type,
        caption: dto.caption,
        authorId,
        mediaId: mediaAsset.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        media: true,
      },
    });

    return post;
  }

  async update(id: string, dto: UpdatePostDto, userId: string, userRole: Role) {
    const post = await this.prisma.post.findFirst({
      where: { id, deletedAt: null },
    });

    if (!post) {
      throw new NotFoundException('포스트를 찾을 수 없습니다.');
    }

    if (post.authorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('이 포스트를 수정할 권한이 없습니다.');
    }

    const updated = await this.prisma.post.update({
      where: { id },
      data: {
        ...(dto.caption !== undefined && { caption: dto.caption }),
        ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        media: true,
      },
    });

    return updated;
  }

  async remove(id: string, userId: string, userRole: Role) {
    const post = await this.prisma.post.findFirst({
      where: { id, deletedAt: null },
    });

    if (!post) {
      throw new NotFoundException('포스트를 찾을 수 없습니다.');
    }

    if (post.authorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('이 포스트를 삭제할 권한이 없습니다.');
    }

    await this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addLike(postId: string, userId: string) {
    // 포스트 존재 확인
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
    });

    if (!post) {
      throw new NotFoundException('포스트를 찾을 수 없습니다.');
    }

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await this.prisma.like.findFirst({
      where: { postId, userId },
    });

    if (existingLike) {
      // 이미 좋아요를 눌렀다면 그냥 반환
      return { message: '이미 좋아요를 눌렀습니다.' };
    }

    // 좋아요 추가
    await this.prisma.like.create({
      data: { postId, userId },
    });

    return { message: '좋아요를 추가했습니다.' };
  }

  async removeLike(postId: string, userId: string) {
    // 좋아요 찾기
    const like = await this.prisma.like.findFirst({
      where: { postId, userId },
    });

    if (!like) {
      throw new NotFoundException('좋아요를 찾을 수 없습니다.');
    }

    // 좋아요 삭제
    await this.prisma.like.delete({
      where: { id: like.id },
    });
  }
}
