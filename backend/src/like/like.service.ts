import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikeService {
  private readonly logger = new Logger(LikeService.name);

  constructor(private prisma: PrismaService) {}

  async likeBlog(blogId: string, userId: string) {
    // Verify blog exists and is published
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    try {
      await this.prisma.like.create({
        data: { userId, blogId },
      });
    } catch (error: any) {
      // Prisma unique constraint violation
      if (error?.code === 'P2002') {
        throw new ConflictException('You have already liked this blog');
      }
      throw error;
    }

    const likeCount = await this.prisma.like.count({ where: { blogId } });

    this.logger.log(`Blog ${blogId} liked by user ${userId}`);

    return { liked: true, likeCount };
  }

  async unlikeBlog(blogId: string, userId: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const like = await this.prisma.like.findUnique({
      where: { userId_blogId: { userId, blogId } },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.prisma.like.delete({
      where: { userId_blogId: { userId, blogId } },
    });

    const likeCount = await this.prisma.like.count({ where: { blogId } });

    this.logger.log(`Blog ${blogId} unliked by user ${userId}`);

    return { liked: false, likeCount };
  }
}
