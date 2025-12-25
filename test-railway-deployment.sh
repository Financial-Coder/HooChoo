#!/bin/bash

echo "🚀 Railway 배포 테스트 시작..."
echo ""

# Railway URL (실제 URL로 변경하세요)
BASE_URL="https://hoochoo-production.up.railway.app"

echo "1. 헬스 체크 (Root endpoint)"
echo "---"
curl -s "$BASE_URL/" || echo "❌ Failed"
echo ""
echo ""

echo "2. Auth 엔드포인트 체크 (404가 아니면 성공)"
echo "---"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{}' || echo "❌ Failed"
echo ""
echo ""

echo "3. Admin 부트스트랩 엔드포인트 체크"
echo "---"
curl -s -X POST "$BASE_URL/auth/bootstrap-admin" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}' || echo "❌ Failed"
echo ""
echo ""

echo "✅ 테스트 완료!"
echo ""
echo "💡 Tip: 200/400/401 같은 HTTP 응답이 보이면 서버가 정상 작동 중입니다."
echo "    404 에러만 안 나오면 성공입니다!"

