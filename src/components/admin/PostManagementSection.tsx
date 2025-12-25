'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import { Post } from '@/lib/types';
import { Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function PostManagementSection() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const { data } = await api.get('/posts?limit=30');
            setPosts(data.data);
        } catch (error) {
            console.error('포스트 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm('정말로 이 포스트를 삭제하시겠습니까?')) {
            return;
        }

        setDeleting(postId);
        try {
            await api.delete(`/posts/${postId}`);
            setPosts(posts.filter(p => p.id !== postId));
        } catch (error) {
            console.error('포스트 삭제 실패:', error);
            alert('포스트 삭제에 실패했습니다.');
        } finally {
            setDeleting(null);
        }
    };

    const getImageUrl = (url: string) => {
        if (url.startsWith('http')) return url;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        return `${baseUrl}${url}`;
    };

    if (loading) {
        return <div className="text-center py-8">로딩 중...</div>;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">포스트 관리</h2>
            <p className="text-muted-foreground">총 {posts.length}개의 포스트</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                        <div className="relative aspect-square bg-muted">
                            {post.media.thumbnailUrl ? (
                                <img
                                    src={getImageUrl(post.media.thumbnailUrl)}
                                    alt={post.caption || ''}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-6xl">📷</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
                                    {post.author.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium">{post.author.name}</span>
                            </div>
                            {post.caption && (
                                <p className="text-sm text-foreground mb-3 line-clamp-2">{post.caption}</p>
                            )}
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                                <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                                <span>❤️ {post._count.likes} 💬 {post._count.comments}</span>
                            </div>
                            <Button
                                type="button"
                                onClick={() => handleDelete(post.id)}
                                disabled={deleting === post.id}
                                className="w-full bg-destructive hover:opacity-90 text-destructive-foreground transition-opacity"
                            >
                                {deleting === post.id ? (
                                    '삭제 중...'
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        삭제
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
