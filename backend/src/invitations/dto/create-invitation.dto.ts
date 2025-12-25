import { IsDateString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateInvitationDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsEnum(Role)
  role!: Role;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
