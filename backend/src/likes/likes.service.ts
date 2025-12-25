import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(postId: string, userId: string) {
    // 포스트 존재 확인
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
    });

    if (!post) {
      throw new NotFoundException('포스트를 찾을 수 없습니다.');
    }

    const existingLike = await this.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      // 좋아요 취소
      await this.prisma.$transaction(async (tx) => {
        await tx.like.delete({
          where: {
            id: existingLike.id,
          },
        });

        await tx.post.update({
          where: { id: postId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
        });
      });

      return { liked: false };
    } else {
      // 좋아요 추가
      await this.prisma.$transaction(async (tx) => {
        await tx.like.create({
          data: {
            postId,
            userId,
          },
        });

        await tx.post.update({
          where: { id: postId },
          data: {
            likeCount: {
              increment: 1,
            },
          },
        });
      });

      return { liked: true };
    }
  }

  async check(postId: string, userId: string): Promise<boolean> {
    const like = await this.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    return !!like;
  }
}
