import {
  Controller,
  Get,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { PublicService } from './public.service';
import { Public } from '../auth/decorators';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

@Public()
@Controller('public')
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Get('feed')
  @Throttle({ default: { ttl: 60000, limit: 60 } })
  async getFeed(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    // Clamp limit
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const safePage = Math.max(page, 1);
    return this.publicService.getFeed({ page: safePage, limit: safeLimit });
  }

  @Get('blogs/:slug')
  @Throttle({ default: { ttl: 60000, limit: 60 } })
  async getBlogBySlug(
    @Param('slug') slug: string,
    @Req() req: Request,
  ) {
    // Extract userId if token present (optional auth)
    const userId = (req as any).user?.id;
    return this.publicService.getBlogBySlug(slug, userId);
  }
}
