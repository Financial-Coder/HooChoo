'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import { Users, Image, Video, MessageCircle, Heart } from 'lucide-react';

interface Stats {
    totalUsers: number;
    totalPosts: number;
    imagePosts: number;
    videoPosts: number;
    totalComments: number;
    totalLikes: number;
}

export default function StatisticsSection() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const { data } = await api.get('/admin/stats');
            setStats(data);
        } catch (error) {
            console.error('통계 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">로딩 중...</div>;
    }

    if (!stats) {
        return <div className="text-center py-8">통계를 불러올 수 없습니다.</div>;
    }

    const statCards = [
        {
            label: '총 사용자',
            value: stats.totalUsers,
            icon: Users,
            color: 'text-blue-500',
        },
        {
            label: '총 포스트',
            value: stats.totalPosts,
            icon: Image,
            color: 'text-purple-500',
        },
        {
            label: '이미지 포스트',
            value: stats.imagePosts,
            icon: Image,
            color: 'text-green-500',
        },
        {
            label: '동영상 포스트',
            value: stats.videoPosts,
            icon: Video,
            color: 'text-pink-500',
        },
        {
            label: '총 댓글',
            value: stats.totalComments,
            icon: MessageCircle,
            color: 'text-orange-500',
        },
        {
            label: '총 좋아요',
            value: stats.totalLikes,
            icon: Heart,
            color: 'text-red-500',
        },
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">통계 대시보드</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((stat) => (
                    <Card key={stat.label} className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-3xl font-bold mt-2">{stat.value.toLocaleString()}</p>
                            </div>
                            <stat.icon className={`w-12 h-12 ${stat.color}`} />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
