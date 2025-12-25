import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { BootstrapAdminDto } from './dto/bootstrap-admin.dto';
import { AuthResponse } from './interfaces/auth-response.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponse> {
    return this.authService.refreshToken(dto);
  }

  /**
   * TEMPORARY: Bootstrap first admin user
   * Remove this endpoint after admin creation
   */
  @Post('bootstrap-admin')
  bootstrapAdmin(@Body() dto: BootstrapAdminDto): Promise<AuthResponse> {
    return this.authService.bootstrapAdmin(dto);
  }
}

