'use client';

import { useState } from 'react';
import { Post } from '@/lib/types';
import Card from '@/components/ui/Card';
import { Heart, MessageCircle } from 'lucide-react';
import api from '@/lib/api';

interface FeedCardProps {
    post: Post;
}

export default function FeedCard({ post }: FeedCardProps) {
    const [isLiked, setIsLiked] = useState(post.isLikedByMe);
    const [likeCount, setLikeCount] = useState(post._count.likes);
    const [isPlaying, setIsPlaying] = useState(false);

    // 백엔드 URL 생성 (상대 경로를 절대 경로로 변환)
    const getImageUrl = (url: string) => {
        if (url.startsWith('http')) return url;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        return `${baseUrl}${url}`;
    };

    const handleLike = async () => {
        const prevLiked = isLiked;
        const prevCount = likeCount;

        // 낙관적 업데이트
        setIsLiked(!prevLiked);
        setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

        try {
            if (prevLiked) {
                await api.delete(`/posts/${post.id}/like`);
            } else {
                await api.post(`/posts/${post.id}/like`);
            }
        } catch (error) {
            // 에러 발생 시 롤백
            setIsLiked(prevLiked);
            setLikeCount(prevCount);
            console.error('좋아요 처리 중 오류:', error);
        }
    };

    return (
        <Card hover className="overflow-hidden">
            {/* 미디어 */}
            <div className="relative aspect-square bg-muted">
                {/* 이미지 게시물 */}
                {post.type === 'IMAGE' && post.media.thumbnailUrl && (
                    <img
                        src={getImageUrl(post.media.thumbnailUrl)}
                        alt={post.caption || ''}
                        className="w-full h-full object-cover"
                    />
                )}

                {/* 동영상 게시물 - 재생 전 */}
                {post.type === 'VIDEO' && !isPlaying && (
                    <>
                        <img
                            src={getImageUrl(post.media.thumbnailUrl)}
                            alt={post.caption || ''}
                            className="w-full h-full object-cover"
                        />
                        <div
                            className="absolute inset-0 flex items-center justify-center cursor-pointer"
                            onClick={() => setIsPlaying(true)}
                        >
                            <div className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 transition-colors flex items-center justify-center">
                                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>
                    </>
                )}

                {/* 동영상 게시물 - 재생 중 */}
                {post.type === 'VIDEO' && isPlaying && (
                    <video
                        src={getImageUrl(post.media.originalUrl)}
                        controls
                        autoPlay
                        className="w-full h-full object-contain bg-black"
                        onEnded={() => setIsPlaying(false)}
                    />
                )}

                {/* 미디어가 없는 경우 */}
                {!post.media.thumbnailUrl && (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">📷</span>
                    </div>
                )}
            </div>

            {/* 콘텐츠 */}
            <div className="p-4">
                {/* 작성자 */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {post.author.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">{post.author.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>

                {/* 캡션 */}
                {post.caption && (
                    <p className="text-foreground mb-3 line-clamp-3">{post.caption}</p>
                )}

                {/* 좋아요/댓글 */}
                <div className="flex items-center gap-4 pt-3 border-t border-border">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 transition-all duration-200 ${isLiked
                            ? 'text-red-500 hover:text-red-600'
                            : 'text-muted-foreground hover:text-red-500'
                            }`}
                    >
                        <Heart
                            className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
                        />
                        <span className="text-sm font-medium">{likeCount}</span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{post._count.comments}</span>
                    </button>
                </div>
            </div>
        </Card>
    );
}
