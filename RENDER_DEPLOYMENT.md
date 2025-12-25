# Render.com 배포 가이드

## 1. Render 계정 생성
https://render.com/ 접속 → GitHub 계정으로 로그인

## 2. PostgreSQL 데이터베이스 생성

1. Dashboard → **New +** → **PostgreSQL**
2. 설정:
   - Name: `hoochoo-db`
   - Database: `hoochoo`
   - User: `hoochoo_user`
   - Region: Singapore (또는 가까운 지역)
   - Plan: **Free**
3. **Create Database** 클릭
4. 생성 후 **Internal Database URL** 복사 (나중에 사용)

## 3. 백엔드 서비스 생성

1. Dashboard → **New +** → **Web Service**
2. **Connect Repository** → GitHub 저장소 선택 (`HooChoo`)
3. 설정:
   - **Name**: `hoochoo-backend`
   - **Region**: Singapore (DB와 동일 지역)
   - **Branch**: `main`
   - **Root Directory**: `backend` ⬅️ 중요!
   - **Runtime**: `Node`
   - **Build Command**: 
     ```bash
     npm ci && npx prisma generate && npm run build
     ```
   - **Start Command**:
     ```bash
     npx prisma db push --accept-data-loss && node dist/main
     ```
   - **Plan**: Free

4. **Advanced** 클릭 → **Add Environment Variable**:
   ```
   DATABASE_URL = [위에서 복사한 Internal Database URL]
   JWT_ACCESS_SECRET = Tc3guQn27JWkpxTw0IQ6MbhLUZyCXOcT81ysKWPjxIQ=
   JWT_REFRESH_SECRET = uanLBEC9RlV2KdCutrfTdO0/mS1pIMLkcDl+znqJQ18=
   JWT_ACCESS_TTL = 15m
   JWT_REFRESH_TTL = 7d
   NODE_ENV = production
   ```

5. **Create Web Service** 클릭

## 4. 배포 확인

1. 배포 로그 확인 (5-10분 소요)
2. 배포 완료 후 URL 확인 (예: `https://hoochoo-backend.onrender.com`)
3. 테스트:
   ```bash
   curl https://hoochoo-backend.onrender.com/
   ```

## 5. 프론트엔드 환경 변수 업데이트

Vercel 프론트엔드 환경 변수에서 백엔드 URL 변경:
```
NEXT_PUBLIC_API_URL = https://hoochoo-backend.onrender.com
```

## 주의사항

### 무료 플랜 제약:
- **백엔드**: 15분 동안 요청이 없으면 sleep 모드 → 첫 요청 시 시작 시간 30초 소요
- **PostgreSQL**: 90일 후 자동 삭제 (무료 플랜)

### 해결책:
- 유료 플랜 ($7/월): sleep 모드 없음, DB 영구 보관
- 또는 매일 cron으로 ping 요청 보내기

## 트러블슈팅

### 빌드 실패 시:
1. Root Directory가 `backend`로 설정되었는지 확인
2. Node 버전 확인 (package.json에 engines 추가 가능)

### 런타임 에러 시:
1. Logs 탭에서 에러 확인
2. 환경 변수가 모두 설정되었는지 확인
3. DATABASE_URL이 올바른지 확인

## 비용 비교

| 항목 | 무료 플랜 | 유료 플랜 |
|------|----------|----------|
| 백엔드 | Free (sleep 모드) | $7/월 (항상 활성) |
| PostgreSQL | Free (90일 제한) | $7/월 (영구) |
| **총액** | **$0/월** | **$14/월** |

## 장점

✅ Railway보다 안정적
✅ 로그가 깔끔하고 디버깅 쉬움
✅ 환경 변수 관리 편함
✅ 무료 플랜 충분히 사용 가능
✅ 자동 HTTPS 인증서

