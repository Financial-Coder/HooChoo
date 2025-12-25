import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
    private readonly uploadsDir = path.join(process.cwd(), 'uploads');
    private readonly originalsDir = path.join(this.uploadsDir, 'originals');
    private readonly thumbnailsDir = path.join(this.uploadsDir, 'thumbnails');

    async saveFile(
        file: Express.Multer.File,
        type: 'IMAGE' | 'VIDEO',
    ): Promise<{
        originalUrl: string;
        thumbnailUrl: string;
        width: number;
        height: number;
    }> {
        // 디렉토리가 존재하지 않으면 생성
        await fs.mkdir(this.originalsDir, { recursive: true });
        await fs.mkdir(this.thumbnailsDir, { recursive: true });

        const fileExt = path.extname(file.originalname);
        const filename = `${randomUUID()}${fileExt}`;

        // 원본 파일 저장
        const originalPath = path.join(this.originalsDir, filename);
        await fs.writeFile(originalPath, file.buffer);

        // 이미지인 경우 썸네일 생성
        let thumbnailUrl: string;
        let width = 0;
        let height = 0;

        if (type === 'IMAGE') {
            const thumbnailFilename = `thumb_${filename}`;
            const thumbnailPath = path.join(this.thumbnailsDir, thumbnailFilename);

            // Sharp로 이미지 정보 가져오기 및 썸네일 생성
            const image = sharp(file.buffer);
            const metadata = await image.metadata();

            width = metadata.width || 0;
            height = metadata.height || 0;

            // 썸네일 생성 (최대 가로 800px)
            await image
                .resize(800, null, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .jpeg({ quality: 85 })
                .toFile(thumbnailPath);

            thumbnailUrl = `/uploads/thumbnails/${thumbnailFilename}`;
        } else {
            // 비디오는 썸네일을 원본과 동일하게 (추후 ffmpeg로 프레임 추출 가능)
            thumbnailUrl = `/uploads/originals/${filename}`;
        }

        return {
            originalUrl: `/uploads/originals/${filename}`,
            thumbnailUrl,
            width,
            height,
        };
    }

    async deleteFile(url: string): Promise<void> {
        try {
            const filename = path.basename(url);
            const dir = url.includes('thumbnails')
                ? this.thumbnailsDir
                : this.originalsDir;
            const filePath = path.join(dir, filename);
            await fs.unlink(filePath);
        } catch (error) {
            console.error('Failed to delete file:', error);
        }
    }
}
