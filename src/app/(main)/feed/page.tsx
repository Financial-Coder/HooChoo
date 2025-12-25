'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import FeedCard from '@/components/feed/FeedCard';
import UploadModal from '@/components/feed/UploadModal';
import type { PostListResponse } from '@/lib/types';

export default function FeedPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setIsLoading(true);
            const response = await api.get<PostListResponse>('/posts?limit=20');
            setPosts(response.data.data);
        } catch (err) {
            setError('피드를 불러오는 중 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* 헤더 */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">후추 피드</h1>
                <p className="text-muted-foreground">가족들이 공유한 소중한 순간들</p>
            </div>

            {/* 로딩 상태 */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton h-96"></div>
                    ))}
                </div>
            )}

            {/* 에러 상태 */}
            {error && !isLoading && (
                <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={loadPosts}
                        className="text-primary hover:underline"
                    >
                        다시 시도
                    </button>
                </div>
            )}

            {/* 빈 피드 */}
            {!isLoading && !error && posts.length === 0 && (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-muted rounded-full mb-6">
                        <span className="text-6xl">📸</span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        아직 포스트가 없습니다
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        첫 번째 추억을 공유해보세요!
                    </p>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
                    >
                        사진 업로드하기
                    </button>
                </div>
            )}

            {/* 피드 그리드 */}
            {!isLoading && !error && posts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map((post) => (
                        <FeedCard key={post.id} post={post} />
                    ))}
                </div>
            )}

            {/* 플로팅 업로드 버튼 */}
            <button
                onClick={() => setIsUploadModalOpen(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center"
                aria-label="업로드"
            >
                <Plus className="w-8 h-8" />
            </button>

            {/* 업로드 모달 */}
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={() => {
                    loadPosts(); // 피드 새로고침
                }}
            />
        </div>
    );
}
