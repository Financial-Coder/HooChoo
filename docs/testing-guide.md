# 테스트 가이드

## 1. 사전 준비

### 데이터베이스 설정
1. PostgreSQL이 실행 중인지 확인:
   ```bash
   # macOS (Homebrew)
   brew services list | grep postgresql
   
   # 또는 직접 확인
   psql -U postgres -c "SELECT version();"
   ```

2. 데이터베이스 생성 (필요한 경우):
   ```bash
   psql -U postgres -c "CREATE DATABASE hooch;"
   ```

3. `.env` 파일 확인:
   ```bash
   cd backend
   cat .env
   ```
   - `DATABASE_URL`이 올바른지 확인
   - `JWT_ACCESS_SECRET`과 `JWT_REFRESH_SECRET`이 설정되어 있는지 확인

### Prisma 마이그레이션
```bash
cd backend
npm run prisma:migrate -- --name init
```

마이그레이션이 성공하면 테이블이 생성됩니다.

## 2. 관리자 계정 생성

초대 시스템을 테스트하려면 먼저 관리자 계정이 필요합니다.

### 방법 1: 스크립트 사용 (권장)
```bash
cd backend
npm run create-admin
```

프롬프트에 따라 이름, 이메일, 비밀번호를 입력하세요.

### 방법 2: Prisma Studio 사용
```bash
cd backend
npm run prisma:studio
```

브라우저에서 `User` 테이블을 열고 직접 추가하세요. 비밀번호는 Argon2로 해싱해야 합니다.

### 방법 3: SQL 직접 실행
```sql
-- 비밀번호 해싱은 별도로 필요 (argon2 사용)
INSERT INTO "User" (id, name, email, "role", "passwordHash", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  '관리자',
  'admin@example.com',
  'ADMIN',
  '$argon2id$v=19$m=65536,t=3,p=4$...', -- 실제 해시 필요
  NOW(),
  NOW()
);
```

## 3. 백엔드 서버 실행

```bash
cd backend
npm run start:dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 4. API 테스트

### 방법 1: 테스트 스크립트 사용

```bash
cd backend
./test-api.sh
```

스크립트는 다음을 테스트합니다:
- 서버 상태 확인
- 초대 수락 (초대 코드 필요)
- 로그인
- Refresh Token

### 방법 2: curl 사용

#### 로그인
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }'
```

응답 예시:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "관리자",
    "role": "ADMIN"
  }
}
```

#### 초대 생성 (관리자 토큰 필요)
```bash
TOKEN="your-access-token"

curl -X POST http://localhost:3000/invitations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "newuser@example.com",
    "role": "MEMBER"
  }'
```

#### 초대 수락
```bash
curl -X POST http://localhost:3000/invitations/accept \
  -H "Content-Type: application/json" \
  -d '{
    "code": "INVITE_CODE",
    "name": "새 사용자",
    "email": "newuser@example.com",
    "password": "password123"
  }'
```

#### Refresh Token
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REFRESH_TOKEN" \
  -d '{
    "refreshToken": "your-refresh-token"
  }'
```

### 방법 3: Postman / Insomnia

1. Postman Collection 생성:
   - `POST /auth/login`
   - `POST /auth/refresh`
   - `POST /invitations` (관리자 토큰 필요)
   - `POST /invitations/accept`

2. 환경 변수 설정:
   - `base_url`: `http://localhost:3000`
   - `access_token`: 로그인 후 저장
   - `refresh_token`: 로그인 후 저장

## 5. 예상되는 오류 및 해결

### "서버에 연결할 수 없습니다"
- 백엔드 서버가 실행 중인지 확인: `npm run start:dev`
- 포트가 3000인지 확인

### "DATABASE_URL이 설정되지 않았습니다"
- `.env` 파일에 `DATABASE_URL`이 있는지 확인
- PostgreSQL이 실행 중인지 확인

### "Prisma Client가 생성되지 않았습니다"
```bash
npm run prisma:generate
```

### "초대를 찾을 수 없습니다"
- 초대 코드가 올바른지 확인
- Prisma Studio에서 `Invitation` 테이블 확인

### "이미 사용한 초대입니다"
- `Invitation.acceptedUserId`가 이미 설정되어 있음
- 새로운 초대 코드 생성 필요

## 6. 다음 단계

테스트가 성공하면:
1. Posts 모듈 구현
2. Comments 모듈 구현
3. Likes 모듈 구현
4. 파일 업로드 기능 추가

