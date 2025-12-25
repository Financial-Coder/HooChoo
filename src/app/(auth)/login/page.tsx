'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { setTokens, setUser } from '@/lib/auth';
import type { AuthResponse } from '@/lib/types';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post<AuthResponse>('/auth/login', {
                email,
                password,
            });

            const { accessToken, refreshToken, user } = response.data;

            // 토큰 및 사용자 정보 저장
            setTokens(accessToken, refreshToken);
            setUser(user);

            // 피드 페이지로 이동
            router.push('/feed');
        } catch (err: any) {
            if (err.response?.status === 401) {
                setError('이메일 또는 비밀번호가 올바르지 않습니다.');
            } else {
                setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    {/* 고양이 아이콘 */}
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-4 paw-animation">
                        <span className="text-4xl">🐾</span>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">HooChoo</h1>
                    <p className="text-muted-foreground">후추 패밀리에 오신 것을 환영합니다</p>
                </div>

                <Card className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            type="email"
                            label="이메일"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />

                        <Input
                            type="password"
                            label="비밀번호"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            로그인
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            가족 초대를 받으셨나요?{' '}
                            <a href="/accept-invite" className="text-primary hover:underline">
                                초대 수락하기
                            </a>
                        </p>
                    </div>
                </Card>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    가족 전용 비공개 앱입니다 🐱
                </p>
            </div>
        </div>
    );
}
