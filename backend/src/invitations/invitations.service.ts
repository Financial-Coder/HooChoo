import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import * as crypto from 'node:crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInvitationDto, creatorId: string) {
    const code = await this.generateUniqueCode();
    return this.prisma.invitation.create({
      data: {
        code,
        email: dto.email?.toLowerCase(),
        role: dto.role ?? Role.MEMBER,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        createdById: creatorId,
      },
    });
  }

  async accept(dto: AcceptInvitationDto) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { code: dto.code },
    });

    if (!invitation) {
      throw new NotFoundException('초대를 찾을 수 없습니다.');
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      throw new BadRequestException('초대가 만료되었습니다.');
    }

    if (invitation.acceptedUserId) {
      throw new BadRequestException('이미 사용한 초대입니다.');
    }

    const emailToUse = invitation.email ?? dto.email;
    if (!emailToUse) {
      throw new BadRequestException('이 초대에는 이메일이 필요합니다.');
    }

    if (
      invitation.email &&
      dto.email &&
      invitation.email.toLowerCase() !== dto.email.toLowerCase()
    ) {
      throw new BadRequestException('초대 이메일과 일치하지 않습니다.');
    }

    const hashedPassword = await argon2.hash(dto.password);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name,
          email: emailToUse.toLowerCase(),
          passwordHash: hashedPassword,
          role: invitation.role,
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { acceptedUserId: user.id },
      });

      return user;
    });
  }

  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let exists = true;
    do {
      code = crypto.randomBytes(4).toString('hex');
      const count = await this.prisma.invitation.count({ where: { code } });
      exists = count > 0;
    } while (exists);

    return code.toUpperCase();
  }
}
