#!/bin/bash
# 간단한 API 테스트 스크립트

BASE_URL="http://localhost:3000"

echo "🧪 HooChoo API 테스트"
echo "===================="
echo ""

# 1. 서버 상태 확인
echo "1️⃣ 서버 상태 확인..."
if curl -s -f "$BASE_URL" > /dev/null 2>&1; then
  echo "✅ 서버 실행 중"
else
  echo "❌ 서버에 연결할 수 없습니다"
  echo "   백엔드 서버를 실행하세요: cd backend && npm run start:dev"
  exit 1
fi
echo ""

# 2. 로그인 테스트 (관리자 계정 필요)
echo "2️⃣ 로그인 테스트..."
echo "   관리자 이메일과 비밀번호를 입력하세요:"
read -p "   이메일: " EMAIL
read -sp "   비밀번호: " PASSWORD
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
  echo "✅ 로그인 성공!"
  ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  echo "   Access Token: ${ACCESS_TOKEN:0:30}..."
  echo "$ACCESS_TOKEN" > /tmp/hoochoo_token.txt
else
  echo "❌ 로그인 실패"
  echo "$LOGIN_RESPONSE"
  exit 1
fi
echo ""

# 3. 피드 조회
echo "3️⃣ 피드 조회 테스트..."
FEED_RESPONSE=$(curl -s "$BASE_URL/posts")
if echo "$FEED_RESPONSE" | grep -q "data"; then
  echo "✅ 피드 조회 성공"
  POST_COUNT=$(echo "$FEED_RESPONSE" | grep -o '"id"' | wc -l | tr -d ' ')
  echo "   포스트 수: $POST_COUNT"
else
  echo "⚠️  피드가 비어있거나 오류 발생"
  echo "$FEED_RESPONSE" | head -5
fi
echo ""

# 4. 포스트 생성 (토큰 필요)
if [ -f /tmp/hoochoo_token.txt ]; then
  TOKEN=$(cat /tmp/hoochoo_token.txt)
  echo "4️⃣ 포스트 생성 테스트..."
  CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/posts" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "type": "IMAGE",
      "caption": "테스트 포스트입니다 🐾"
    }')
  
  if echo "$CREATE_RESPONSE" | grep -q "id"; then
    echo "✅ 포스트 생성 성공"
    POST_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "   포스트 ID: $POST_ID"
  else
    echo "⚠️  포스트 생성 실패"
    echo "$CREATE_RESPONSE"
  fi
else
  echo "4️⃣ 포스트 생성 테스트 스킵 (토큰 없음)"
fi
echo ""

echo "🎉 테스트 완료!"

