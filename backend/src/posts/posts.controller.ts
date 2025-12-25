import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @Get()
  async findAll(@Query() query: QueryPostsDto, @Req() req?: Request) {
    const userId = (req?.user as JwtPayload)?.sub;
    return this.postsService.findAll(query, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req?: Request) {
    const userId = (req?.user as JwtPayload)?.sub;
    return this.postsService.findOne(id, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() dto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const user = req.user as JwtPayload;
    return this.postsService.create(dto, file, user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    return this.postsService.update(id, dto, user.sub, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    await this.postsService.remove(id, user.sub, user.role);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async addLike(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.postsService.addLike(id, user.sub);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeLike(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    await this.postsService.removeLike(id, user.sub);
  }
}
