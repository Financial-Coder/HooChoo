'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import StatisticsSection from '@/components/admin/StatisticsSection';
import PostManagementSection from '@/components/admin/PostManagementSection';
import UserManagementSection from '@/components/admin/UserManagementSection';
import InvitationSection from '@/components/admin/InvitationSection';

type TabType = 'stats' | 'posts' | 'users' | 'invite';

export default function AdminPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('stats');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = getUser();
        if (!user || user.role !== 'ADMIN') {
            router.push('/feed');
            return;
        }
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">로딩 중...</div>
            </div>
        );
    }

    const tabs = [
        { id: 'stats' as TabType, label: '통계 대시보드' },
        { id: 'posts' as TabType, label: '포스트 관리' },
        { id: 'users' as TabType, label: '사용자 관리' },
        { id: 'invite' as TabType, label: '가족 초대' },
    ];

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">관리자 대시보드</h1>

            {/* 탭 네비게이션 */}
            <div className="border-b border-border mb-6">
                <div className="flex gap-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 font-medium transition-colors relative ${activeTab === tab.id
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* 탭 콘텐츠 */}
            <div>
                {activeTab === 'stats' && <StatisticsSection />}
                {activeTab === 'posts' && <PostManagementSection />}
                {activeTab === 'users' && <UserManagementSection />}
                {activeTab === 'invite' && <InvitationSection />}
            </div>
        </div>
    );
}
