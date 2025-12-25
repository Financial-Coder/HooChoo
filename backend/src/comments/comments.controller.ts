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
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async findAll(
    @Param('postId') postId: string,
    @Query() query: QueryCommentsDto,
  ) {
    return this.commentsService.findAll(postId, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    return this.commentsService.create(postId, dto, user.sub);
  }

  @Patch(':commentId')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('commentId') id: string,
    @Body() dto: UpdateCommentDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    return this.commentsService.update(id, dto, user.sub);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('commentId') id: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    await this.commentsService.remove(id, user.sub);
  }
}
