/**
 * 관리자 계정 생성 스크립트
 * 사용법: npx ts-node scripts/create-admin.ts
 */
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const prisma = new PrismaClient();

async function createAdmin() {
  const rl = readline.createInterface({ input, output });

  try {
    console.log('👤 관리자 계정 생성\n');

    const name = await rl.question('이름: ');
    const email = await rl.question('이메일: ');
    const password = await rl.question('비밀번호 (최소 8자): ');

    if (password.length < 8) {
      console.error('❌ 비밀번호는 최소 8자 이상이어야 합니다.');
      process.exit(1);
    }

    const passwordHash = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: 'ADMIN',
      },
    });

    console.log('\n✅ 관리자 계정이 생성되었습니다!');
    console.log(`ID: ${user.id}`);
    console.log(`이메일: ${user.email}`);
    console.log(`역할: ${user.role}`);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        console.error('❌ 이미 존재하는 이메일입니다.');
      } else {
        console.error('❌ 오류:', error.message);
      }
    } else {
      console.error('❌ 알 수 없는 오류:', error);
    }
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

void createAdmin();

