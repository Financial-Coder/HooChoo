import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      totalPosts,
      imagePosts,
      videoPosts,
      totalComments,
      totalLikes,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.post.count({
        where: { deletedAt: null },
      }),
      this.prisma.post.count({
        where: { type: 'IMAGE', deletedAt: null },
      }),
      this.prisma.post.count({
        where: { type: 'VIDEO', deletedAt: null },
      }),
      this.prisma.comment.count({
        where: { deletedAt: null },
      }),
      this.prisma.like.count(),
    ]);

    return {
      totalUsers,
      totalPosts,
      imagePosts,
      videoPosts,
      totalComments,
      totalLikes,
    };
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }
}
