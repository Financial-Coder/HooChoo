# Backend 개발 가이드

## 1. 사전 준비
- Node.js LTS (nvm으로 `nvm use --lts` 권장)
- PostgreSQL 인스턴스 (로컬 또는 클라우드)
- AWS S3/CloudFront 자격 증명 (향후 업로드 기능용)

## 2. 환경 변수 세팅
1. `cd backend`
2. `.env.example`를 `.env`로 복사 후 `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` 등을 실제 값으로 수정합니다.
   ```bash
   cp .env.example .env
   # 예시
   # DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hooch?schema=public"
   ```
3. 추후 S3/CloudFront 자격증명, 추가 토큰 설정 등이 확정되면 동일 파일에 추가합니다.

## 3. 의존성 설치 및 Prisma 준비
```bash
cd backend
npm install
npm run prisma:generate
# 초기 스키마 반영 (DB 비어 있을 때)
npm run prisma:migrate -- --name init
```
- 마이그레이션 실행 전에 데이터베이스가 존재해야 합니다.
- Prisma Client 출력은 `backend/generated/prisma`에 생성됩니다.

## 4. 서버 실행
```bash
npm run start:dev
```
- 기본 포트: `http://localhost:3000` (Nest 기본값). 필요 시 `main.ts`에서 수정.
- Prisma Studio로 데이터 확인 시 `npm run prisma:studio`를 사용할 수 있습니다.

## 5. 다음 단계 체크리스트
- Auth 모듈 생성(로그인/초대 수락 API)
- Posts / Comments / Likes 모듈 scaffold
- 파일 업로드용 S3 signed URL 서비스 추가
- OpenAPI 명세(`docs/api-spec.yaml`)와 연동해 e2e 테스트 케이스 작성
