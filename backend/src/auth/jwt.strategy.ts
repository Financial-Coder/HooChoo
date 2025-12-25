/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call -- passport-jwt exposes CJS helpers without complete typings */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { JwtFromRequestFunction, StrategyOptions } from 'passport-jwt';
import type { Request } from 'express';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const jwtFromRequest: JwtFromRequestFunction = (req: Request) => {
      const header = req?.headers?.authorization;
      if (!header) {
        return null;
      }
      const [type, token] = header.split(' ');
      if (type?.toLowerCase() !== 'bearer' || !token) {
        return null;
      }
      return token;
    };
    const accessSecret = configService.get<string>('JWT_ACCESS_SECRET');
    if (!accessSecret) {
      throw new Error('JWT_ACCESS_SECRET is not configured');
    }

    const options = {
      jwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: accessSecret,
    } satisfies StrategyOptions;

    super(options);
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
