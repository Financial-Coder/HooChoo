'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { setTokens, setUser } from '@/lib/auth';
import type { AuthResponse } from '@/lib/types';

export default function AcceptInvitePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code') || '';

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!code) {
            setError('초대 코드가 필요합니다.');
        }
    }, [code]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (password.length < 8) {
            setError('비밀번호는 최소 8자 이상이어야 합니다.');
            setIsLoading(false);
            return;
        }

        try {
            // 초대 수락
            await api.post('/invitations/accept', {
                code,
                name,
                email,
                password,
            });

            // 자동 로그인
            const loginResponse = await api.post<AuthResponse>('/auth/login', {
                email,
                password,
            });

            const { accessToken, refreshToken, user } = loginResponse.data;
            setTokens(accessToken, refreshToken);
            setUser(user);

            // 피드 페이지로 이동
            router.push('/feed');
        } catch (err: any) {
            if (err.response?.status === 404) {
                setError('유효하지 않은 초대 코드입니다.');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('가입 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary rounded-full mb-4 paw-animation">
                        <span className="text-4xl">✨</span>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">가족 초대 수락</h1>
                    <p className="text-muted-foreground">
                        {code ? `초대 코드: ${code}` : '초대 코드가 필요합니다'}
                    </p>
                </div>

                <Card className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            type="text"
                            label="이름"
                            placeholder="홍길동"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={isLoading || !code}
                        />

                        <Input
                            type="email"
                            label="이메일"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading || !code}
                            helperText="로그인 시 사용할 이메일 주소입니다"
                        />

                        <Input
                            type="password"
                            label="비밀번호"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading || !code}
                            helperText="최소 8자 이상 입력해주세요"
                        />

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="secondary"
                            size="lg"
                            className="w-full"
                            isLoading={isLoading}
                            disabled={!code}
                        >
                            가입하기
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            이미 계정이 있으신가요?{' '}
                            <a href="/login" className="text-secondary hover:underline">
                                로그인하기
                            </a>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
