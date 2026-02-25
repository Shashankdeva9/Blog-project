import { IsString, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title!: string;

  @IsString()
  @MinLength(10, { message: 'Content must be at least 10 characters' })
  content!: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
