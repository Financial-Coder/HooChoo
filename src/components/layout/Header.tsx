'use client';

import { useState, useEffect } from 'react';
import { logout, getUser } from '@/lib/auth';
import { User } from '@/lib/types';

export default function Header() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // 클라이언트에서만 사용자 정보 로드
        setUser(getUser());
    }, []);

    const handleLogout = () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            logout();
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* 로고 */}
                <a href="/feed" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <span className="text-2xl">🐾</span>
                    <h1 className="text-xl font-bold text-foreground">HooChoo</h1>
                </a>

                {/* 우측 메뉴 */}
                <div className="flex items-center gap-4">
                    {user && (
                        <>
                            <div className="hidden sm:flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-foreground">{user.name}</span>
                                <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
                                    {user.role === 'ADMIN' ? '관리자' : '가족'}
                                </span>
                            </div>

                            {user.role === 'ADMIN' && (
                                <a
                                    href="/admin"
                                    className="text-sm px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity font-medium"
                                >
                                    관리자
                                </a>
                            )}

                            <button
                                onClick={handleLogout}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                로그아웃
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
