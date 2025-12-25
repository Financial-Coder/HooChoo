'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // 이미 로그인되어 있으면 피드로 리다이렉트
        if (isAuthenticated()) {
            router.push('/feed');
        }
    }, [router]);

    // 서버 렌더링 시에는 초기 상태 반환
    if (!mounted) {
        return <>{children}</>;
    }

    return <>{children}</>;
}
