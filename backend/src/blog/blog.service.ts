import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto, UpdateBlogDto } from './dto';
import { generateSlug, generateUniqueSlug } from './utils/slug.util';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBlogDto) {
    let slug = generateSlug(dto.title);

    // Check slug uniqueness
    const existing = await this.prisma.blog.findUnique({ where: { slug } });
    if (existing) {
      slug = generateUniqueSlug(dto.title);
    }

    const blog = await this.prisma.blog.create({
      data: {
        userId,
        title: dto.title,
        slug,
        content: dto.content,
        isPublished: dto.isPublished ?? false,
        summary: dto.content.substring(0, 200) + (dto.content.length > 200 ? '...' : ''),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    this.logger.log(`Blog created: ${blog.slug} by user ${userId}`);
    return blog;
  }

  async findAllByUser(userId: string) {
    return this.prisma.blog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });
  }

  async findOneByUser(id: string, userId: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.userId !== userId) {
      throw new ForbiddenException('You can only access your own blogs');
    }

    return blog;
  }

  async update(id: string, userId: string, dto: UpdateBlogDto) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.userId !== userId) {
      throw new ForbiddenException('You can only edit your own blogs');
    }

    let slug = blog.slug;
    if (dto.title && dto.title !== blog.title) {
      slug = generateSlug(dto.title);
      const existingSlug = await this.prisma.blog.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existingSlug) {
        slug = generateUniqueSlug(dto.title);
      }
    }

    const updatedContent = dto.content || blog.content;
    const summary = updatedContent.substring(0, 200) + (updatedContent.length > 200 ? '...' : '');

    const updated = await this.prisma.blog.update({
      where: { id },
      data: {
        ...dto,
        slug,
        summary,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    this.logger.log(`Blog updated: ${updated.slug}`);
    return updated;
  }

  async delete(id: string, userId: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.userId !== userId) {
      throw new ForbiddenException('You can only delete your own blogs');
    }

    await this.prisma.blog.delete({ where: { id } });

    this.logger.log(`Blog deleted: ${blog.slug}`);
    return { message: 'Blog deleted successfully' };
  }
}
