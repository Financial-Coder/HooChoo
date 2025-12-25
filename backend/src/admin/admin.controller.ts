import {
    Controller,
    Get,
    UseGuards,
    Req,
    ForbiddenException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('stats')
    async getStats(@Req() req: Request) {
        const user = req.user as JwtPayload;
        if (user.role !== Role.ADMIN) {
            throw new ForbiddenException('관리자만 접근할 수 있습니다.');
        }
        return this.adminService.getStats();
    }

    @Get('users')
    async getAllUsers(@Req() req: Request) {
        const user = req.user as JwtPayload;
        if (user.role !== Role.ADMIN) {
            throw new ForbiddenException('관리자만 접근할 수 있습니다.');
        }
        return this.adminService.getAllUsers();
    }
}
