#!/bin/bash
# HooChoo API 테스트 스크립트

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "🧪 HooChoo API 테스트 시작"
echo "Base URL: $BASE_URL"
echo ""

# 1. 서버 상태 확인
echo "1️⃣ 서버 상태 확인..."
if curl -s -f "$BASE_URL" > /dev/null 2>&1; then
  echo "✅ 서버가 실행 중입니다"
else
  echo "❌ 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요."
  echo "   실행: cd backend && npm run start:dev"
  exit 1
fi
echo ""

# 2. 초대 생성 (관리자 토큰 필요 - 일단 스킵)
echo "2️⃣ 초대 생성 테스트 (관리자 토큰 필요 - 스킵)"
echo ""

# 3. 초대 수락으로 사용자 생성
echo "3️⃣ 초대 수락으로 사용자 생성..."
INVITE_CODE="${INVITE_CODE:-TEST1234}"
ACCEPT_RESPONSE=$(curl -s -X POST "$BASE_URL/invitations/accept" \
  -H "Content-Type: application/json" \
  -d "{
    \"code\": \"$INVITE_CODE\",
    \"name\": \"테스트 사용자\",
    \"email\": \"test@example.com\",
    \"password\": \"testpassword123\"
  }")

if echo "$ACCEPT_RESPONSE" | grep -q "id"; then
  echo "✅ 사용자 생성 성공"
  echo "$ACCEPT_RESPONSE" | jq '.' 2>/dev/null || echo "$ACCEPT_RESPONSE"
else
  echo "⚠️  사용자 생성 실패 (초대 코드가 없거나 이미 사용됨)"
  echo "$ACCEPT_RESPONSE"
fi
echo ""

# 4. 로그인
echo "4️⃣ 로그인 테스트..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test@example.com\",
    \"password\": \"testpassword123\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
  echo "✅ 로그인 성공"
  ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken' 2>/dev/null)
  REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refreshToken' 2>/dev/null)
  echo "Access Token: ${ACCESS_TOKEN:0:50}..."
  echo "Refresh Token: ${REFRESH_TOKEN:0:50}..."
  
  # 토큰을 파일에 저장 (다음 테스트에서 사용)
  echo "$ACCESS_TOKEN" > /tmp/hoochoo_access_token.txt
  echo "$REFRESH_TOKEN" > /tmp/hoochoo_refresh_token.txt
else
  echo "❌ 로그인 실패"
  echo "$LOGIN_RESPONSE"
  exit 1
fi
echo ""

# 5. Refresh Token 테스트
echo "5️⃣ Refresh Token 테스트..."
if [ -f /tmp/hoochoo_refresh_token.txt ]; then
  REFRESH_TOKEN=$(cat /tmp/hoochoo_refresh_token.txt)
  REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $REFRESH_TOKEN" \
    -d "{
      \"refreshToken\": \"$REFRESH_TOKEN\"
    }")
  
  if echo "$REFRESH_RESPONSE" | grep -q "accessToken"; then
    echo "✅ Refresh Token 성공"
    echo "$REFRESH_RESPONSE" | jq '.' 2>/dev/null || echo "$REFRESH_RESPONSE"
  else
    echo "⚠️  Refresh Token 실패"
    echo "$REFRESH_RESPONSE"
  fi
else
  echo "⚠️  Refresh Token 파일이 없어 스킵"
fi
echo ""

echo "🎉 테스트 완료!"
echo ""
echo "💡 다음 단계:"
echo "   - 관리자 계정을 만들려면 직접 DB에 INSERT하거나"
echo "   - 초대 API를 사용하세요 (관리자 토큰 필요)"

