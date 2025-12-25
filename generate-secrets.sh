#!/bin/bash

# JWT 시크릿 키 생성 스크립트

echo "=== JWT Secret Keys ==="
echo ""
echo "JWT_ACCESS_SECRET=$(openssl rand -base64 32)"
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 32)"
echo ""
echo "위 값들을 복사해서 Railway 환경 변수에 설정하세요."

