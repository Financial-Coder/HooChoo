import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

// BigInt를 JSON으로 직렬화할 수 있도록 설정
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS 설정: 프론트엔드에서의 요청 허용
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://localhost:3000',
      'https://hoo-choo-1f18.vercel.app',
      'https://hoo-choo.vercel.app', // 프로덕션 Vercel URL
    ],
    credentials: true,
  });

  // 정적 파일 서빙 (uploads 폴더)
  try {
    app.useStaticAssets(join(__dirname, '..', '..', 'uploads'), {
      prefix: '/uploads/',
    });
  } catch (error) {
    console.warn('Failed to setup static assets:', error);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
