import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(postId: string, query: QueryCommentsDto) {
    const limit = 20;

    const where: any = {
      postId,
      deletedAt: null,
    };

    if (query.cursor) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where.id = {
        gt: query.cursor,
      };
    }

    const comments = await this.prisma.comment.findMany({
      where,
      take: limit + 1,
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    const hasNext = comments.length > limit;
    const data = hasNext ? comments.slice(0, limit) : comments;
    const nextCursor = hasNext ? data[data.length - 1].id : null;

    return {
      data,
      nextCursor,
    };
  }

  async create(postId: string, dto: CreateCommentDto, authorId: string) {
    // 포스트 존재 확인
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
    });

    if (!post) {
      throw new NotFoundException('포스트를 찾을 수 없습니다.');
    }

    const comment = await this.prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          postId,
          authorId,
          content: dto.content,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });

      // 댓글 수 증가
      await tx.post.update({
        where: { id: postId },
        data: {
          commentCount: {
            increment: 1,
          },
        },
      });

      return newComment;
    });

    return comment;
  }

  async update(id: string, dto: UpdateCommentDto, userId: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('이 댓글을 수정할 권한이 없습니다.');
    }

    const updated = await this.prisma.comment.update({
      where: { id },
      data: {
        content: dto.content,
        editedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('이 댓글을 삭제할 권한이 없습니다.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.comment.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      // 댓글 수 감소
      await tx.post.update({
        where: { id: comment.postId },
        data: {
          commentCount: {
            decrement: 1,
          },
        },
      });
    });
  }
}
