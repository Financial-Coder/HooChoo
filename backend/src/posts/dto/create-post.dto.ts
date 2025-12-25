import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { MediaType } from '@prisma/client';

export class CreatePostDto {
  @IsEnum(MediaType)
  type: MediaType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;

  // 파일 업로드는 나중에 S3 연동 시 처리
  // @IsNotEmpty()
  // file: Express.Multer.File;
}
