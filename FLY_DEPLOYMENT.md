# Fly.io 배포 가이드

Fly.io는 Dockerfile을 사용하여 배포하므로 더 유연하고 빠릅니다.

## 1. Fly CLI 설치

### macOS:
```bash
brew install flyctl
```

또는:
```bash
curl -L https://fly.io/install.sh | sh
```

## 2. Fly 계정 생성 및 로그인

```bash
flyctl auth signup  # 계정 생성
# 또는
flyctl auth login   # 기존 계정 로그인
```

## 3. PostgreSQL 데이터베이스 생성

```bash
flyctl postgres create --name hoochoo-db --region sin
```

설정 선택:
- Region: Singapore (sin) 또는 Tokyo (nrt)
- Plan: Development (무료)

생성 후 CONNECTION STRING 복사:
```
postgres://postgres:password@hoochoo-db.internal:5432
```

## 4. 백엔드 앱 생성

```bash
cd /Users/dongyounglim/HooChoo/backend
flyctl launch
```

질문에 대답:
- **App name**: `hoochoo-backend` (또는 원하는 이름)
- **Region**: Singapore
- **PostgreSQL**: No (이미 생성했음)
- **Redis**: No
- **Deploy now**: No (환경 변수 먼저 설정)

## 5. 환경 변수 설정

```bash
# DATABASE_URL (위에서 복사한 CONNECTION STRING 사용)
flyctl secrets set DATABASE_URL="postgresql://postgres:password@hoochoo-db.internal:5432/hoochoo"

# JWT Secrets
flyctl secrets set JWT_ACCESS_SECRET="Tc3guQn27JWkpxTw0IQ6MbhLUZyCXOcT81ysKWPjxIQ="
flyctl secrets set JWT_REFRESH_SECRET="uanLBEC9RlV2KdCutrfTdO0/mS1pIMLkcDl+znqJQ18="
flyctl secrets set JWT_ACCESS_TTL="15m"
flyctl secrets set JWT_REFRESH_TTL="7d"
flyctl secrets set NODE_ENV="production"
```

## 6. fly.toml 파일 수정

`backend/fly.toml` 파일 생성 또는 수정:

```toml
app = "hoochoo-backend"
primary_region = "sin"

[build]
  dockerfile = "../Dockerfile"

[env]
  PORT = "3000"
  NODE_ENV = "production"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

## 7. Dockerfile 확인

프로젝트 루트의 `Dockerfile`이 있는지 확인 (이미 있음):
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm ci
COPY backend/ .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/prisma ./prisma/
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD npx prisma db push --accept-data-loss && node dist/main
```

## 8. 배포!

```bash
cd /Users/dongyounglim/HooChoo/backend
flyctl deploy
```

## 9. 배포 확인

```bash
# 앱 상태 확인
flyctl status

# 로그 확인
flyctl logs

# 앱 열기
flyctl open
```

테스트:
```bash
curl https://hoochoo-backend.fly.dev/
```

## 10. 데이터베이스 연결 확인

PostgreSQL에 직접 접속:
```bash
flyctl postgres connect -a hoochoo-db
```

## 비용

### 무료 플랜:
- VM: 3개 무료 (1개만 사용하므로 충분)
- PostgreSQL: 무료 (3GB 스토리지)
- 대역폭: 160GB/월 무료
- **총액**: $0/월

### 장점:
- ✅ 매우 빠른 배포 속도 (2-3분)
- ✅ Dockerfile 사용으로 완전한 제어
- ✅ 글로벌 엣지 네트워크
- ✅ Auto-scaling (sleep 모드)
- ✅ 로그 관리 쉬움

### 주의사항:
- Auto-stop이 활성화되어 있어 트래픽 없으면 sleep
- 첫 요청 시 웜업 시간 필요 (10-20초)

## 추가 명령어

```bash
# 앱 삭제
flyctl apps destroy hoochoo-backend

# 환경 변수 확인
flyctl secrets list

# 스케일링
flyctl scale count 2

# 앱 재시작
flyctl apps restart hoochoo-backend
```

## 트러블슈팅

### 빌드 실패:
```bash
flyctl logs --app hoochoo-backend
```

### 데이터베이스 연결 실패:
DATABASE_URL의 호스트를 `hoochoo-db.internal`로 변경

### 메모리 부족:
```bash
flyctl scale memory 512
```

