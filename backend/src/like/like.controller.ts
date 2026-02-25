import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';

@UseGuards(JwtAuthGuard)
@Controller('blogs')
export class LikeController {
  constructor(private likeService: LikeService) {}

  @Post(':id/like')
  @HttpCode(HttpStatus.CREATED)
  async like(
    @Param('id') blogId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.likeService.likeBlog(blogId, userId);
  }

  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  async unlike(
    @Param('id') blogId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.likeService.unlikeBlog(blogId, userId);
  }
}
