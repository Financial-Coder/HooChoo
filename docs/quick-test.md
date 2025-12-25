# 빠른 API 테스트 가이드

## 1. 서버 시작

```bash
cd backend
npm run start:dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 2. 기본 API 테스트

### 2.1 피드 조회 (인증 불필요)
```bash
curl http://localhost:3000/posts
```

### 2.2 로그인
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }'
```

응답에서 `accessToken`을 복사하세요.

### 2.3 포스트 생성 (인증 필요)
```bash
TOKEN="your-access-token"

curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "IMAGE",
    "caption": "테스트 포스트입니다 🐾"
  }'
```

### 2.4 댓글 작성
```bash
curl -X POST http://localhost:3000/posts/POST_ID/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "귀여워요! 🐾"
  }'
```

### 2.5 좋아요
```bash
curl -X POST http://localhost:3000/posts/POST_ID/like \
  -H "Authorization: Bearer $TOKEN"
```

## 3. 테스트 스크립트 사용

```bash
cd backend
./test-api-simple.sh
```

스크립트가 대화형으로 테스트를 진행합니다.

## 4. 예상되는 문제

### 서버가 시작되지 않음
- `.env` 파일에 `DATABASE_URL`이 올바르게 설정되어 있는지 확인
- PostgreSQL이 실행 중인지 확인
- `npm run prisma:migrate -- --name init` 실행 여부 확인

### 로그인 실패
- 관리자 계정이 생성되어 있는지 확인: `npm run create-admin`
- 비밀번호가 올바른지 확인

### 포스트 생성 실패
- JWT 토큰이 유효한지 확인
- 토큰이 만료되지 않았는지 확인

## 5. 데이터베이스 확인

Prisma Studio로 데이터 확인:
```bash
cd backend
npm run prisma:studio
```

브라우저에서 `http://localhost:5555`가 열립니다.

