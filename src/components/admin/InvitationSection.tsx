'use client';

import { useState } from 'react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Copy, Check, Link2 } from 'lucide-react';

export default function InvitationSection() {
    const [inviteCode, setInviteCode] = useState('');
    const [inviteUrl, setInviteUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateInvite = async () => {
        setIsGenerating(true);
        try {
            const { data } = await api.post('/invitations', {
                email: null, // 이메일 없이 생성
                role: 'MEMBER',
            });

            setInviteCode(data.code);
            const url = `${window.location.origin}/accept-invite?code=${data.code}`;
            setInviteUrl(url);
        } catch (error) {
            console.error('초대 링크 생성 실패:', error);
            alert('초대 링크 생성에 실패했습니다.');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('클립보드 복사 실패:', error);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">가족 초대</h2>
            <p className="text-muted-foreground">
                새로운 가족 구성원을 초대하여 후추의 소중한 순간을 함께 공유하세요!
            </p>

            <Card className="p-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary mb-4">
                        <Link2 className="w-5 h-5" />
                        <h3 className="font-semibold">초대 링크 생성</h3>
                    </div>

                    {!inviteUrl ? (
                        <Button
                            variant="primary"
                            onClick={generateInvite}
                            isLoading={isGenerating}
                            className="w-full"
                        >
                            새 초대 링크 생성
                        </Button>
                    ) : (
                        <div className="space-y-3">
                            <div className="p-4 bg-muted rounded-lg border border-border">
                                <p className="text-sm text-muted-foreground mb-2">초대 코드</p>
                                <p className="font-mono text-lg font-bold text-primary">{inviteCode}</p>
                            </div>

                            <div className="p-4 bg-muted rounded-lg border border-border">
                                <p className="text-sm text-muted-foreground mb-2">초대 링크</p>
                                <p className="text-sm break-all text-foreground">{inviteUrl}</p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="primary"
                                    onClick={copyToClipboard}
                                    className="flex-1"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            복사됨!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-2" />
                                            링크 복사
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setInviteUrl('');
                                        setInviteCode('');
                                    }}
                                >
                                    새로 생성
                                </Button>
                            </div>

                            <div className="p-3 bg-accent rounded-lg">
                                <p className="text-xs text-accent-foreground">
                                    💡 이 링크를 가족에게 공유하면 계정을 만들고 후추 가족 앱에 참여할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
