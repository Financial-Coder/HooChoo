import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('posts/:postId/like')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('postId') postId: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.likesService.toggle(postId, user.sub);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('postId') postId: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    await this.likesService.toggle(postId, user.sub);
  }
}
