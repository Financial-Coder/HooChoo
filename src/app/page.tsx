'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // 홈페이지 접속 시 로그인 페이지로 리다이렉트
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="paw-animation inline-block mb-4">
          <span className="text-6xl">🐾</span>
        </div>
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    </div>
  );
}
