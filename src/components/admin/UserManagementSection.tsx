'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'MEMBER';
    createdAt: string;
    lastLoginAt: string | null;
    _count: {
        posts: number;
        comments: number;
        likes: number;
    };
}

export default function UserManagementSection() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data);
        } catch (error) {
            console.error('사용자 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">로딩 중...</div>;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">사용자 관리</h2>
            <p className="text-muted-foreground">총 {users.length}명의 사용자</p>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left p-3 font-semibold">사용자</th>
                            <th className="text-left p-3 font-semibold">이메일</th>
                            <th className="text-left p-3 font-semibold">역할</th>
                            <th className="text-left p-3 font-semibold">가입일</th>
                            <th className="text-left p-3 font-semibold">마지막 로그인</th>
                            <th className="text-right p-3 font-semibold">포스트</th>
                            <th className="text-right p-3 font-semibold">댓글</th>
                            <th className="text-right p-3 font-semibold">좋아요</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium">{user.name}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-muted-foreground">{user.email}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'ADMIN'
                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                        }`}>
                                        {user.role === 'ADMIN' ? '관리자' : '가족'}
                                    </span>
                                </td>
                                <td className="p-3 text-sm text-muted-foreground">
                                    {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                                </td>
                                <td className="p-3 text-sm text-muted-foreground">
                                    {user.lastLoginAt
                                        ? new Date(user.lastLoginAt).toLocaleDateString('ko-KR')
                                        : '-'
                                    }
                                </td>
                                <td className="p-3 text-right text-sm">{user._count.posts}</td>
                                <td className="p-3 text-right text-sm">{user._count.comments}</td>
                                <td className="p-3 text-right text-sm">{user._count.likes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
