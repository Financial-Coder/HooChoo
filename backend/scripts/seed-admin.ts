/**
 * 배포 시 자동으로 관리자 계정을 생성하는 스크립트
 * 환경 변수를 통해 admin 계정 정보를 받아옵니다.
 */
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function seedAdmin() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
        const adminName = process.env.ADMIN_NAME || 'Admin';

        // 이미 admin 계정이 존재하는지 확인
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (existingAdmin) {
            console.log('✅ Admin account already exists:', adminEmail);
            return;
        }

        // 비밀번호 해싱
        const passwordHash = await argon2.hash(adminPassword);

        // Admin 계정 생성
        const admin = await prisma.user.create({
            data: {
                name: adminName,
                email: adminEmail.toLowerCase(),
                passwordHash,
                role: 'ADMIN',
            },
        });

        console.log('✅ Admin account created successfully!');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   Role: ${admin.role}`);
    } catch (error) {
        if (error instanceof Error) {
            console.error('❌ Error creating admin account:', error.message);
        } else {
            console.error('❌ Unknown error:', error);
        }
        // 배포가 실패하지 않도록 exit code 0으로 종료
        process.exit(0);
    } finally {
        await prisma.$disconnect();
    }
}

void seedAdmin();
