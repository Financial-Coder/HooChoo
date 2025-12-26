'use client';

import { useState, useEffect } from 'react';
import { Post, Comment, CommentListResponse } from '@/lib/types';
import Card from '@/components/ui/Card';
import { Heart, MessageCircle, Send, Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface FeedCardProps {
    post: Post;
}

export default function FeedCard({ post }: FeedCardProps) {
    const [isLiked, setIsLiked] = useState(post.isLikedByMe);
    const [likeCount, setLikeCount] = useState(post._count.likes);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentCount, setCommentCount] = useState(post._count.comments);
    const [commentInput, setCommentInput] = useState('');
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // 백엔드 URL 생성 (상대 경로를 절대 경로로 변환)
    const getImageUrl = (url: string) => {
        if (url.startsWith('http')) return url;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        return `${baseUrl}${url}`;
    };

    // 현재 사용자 ID 가져오기
    useEffect(() => {
        const getUserId = async () => {
            try {
                const response = await api.get('/auth/me');
                setCurrentUserId(response.data.id);
            } catch (error) {
                // 로그인하지 않은 경우
                setCurrentUserId(null);
            }
        };
        getUserId();
    }, []);

    // 댓글 토글
    const handleToggleComments = async () => {
        if (!showComments && comments.length === 0) {
            // 처음 열 때만 댓글 로드
            await fetchComments();
        }
        setShowComments(!showComments);
    };

    // 댓글 목록 가져오기
    const fetchComments = async () => {
        setIsLoadingComments(true);
        try {
            const response = await api.get<CommentListResponse>(`/posts/${post.id}/comments`);
            setComments(response.data.data);
        } catch (error) {
            console.error('댓글 로드 중 오류:', error);
        } finally {
            setIsLoadingComments(false);
        }
    };

    // 댓글 작성
    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentInput.trim() || isSubmitting) return;

        const tempComment: Comment = {
            id: 'temp-' + Date.now(),
            postId: post.id,
            author: {
                id: currentUserId || '',
                name: '나',
                avatarUrl: null,
            },
            content: commentInput,
            createdAt: new Date().toISOString(),
            editedAt: null,
        };

        // 낙관적 업데이트
        setComments([...comments, tempComment]);
        setCommentCount(commentCount + 1);
        setCommentInput('');
        setIsSubmitting(true);

        try {
            const response = await api.post<Comment>(`/posts/${post.id}/comments`, {
                content: commentInput,
            });
            // 임시 댓글을 실제 댓글로 교체
            setComments(prev => prev.map(c => c.id === tempComment.id ? response.data : c));
        } catch (error) {
            // 에러 시 롤백
            setComments(prev => prev.filter(c => c.id !== tempComment.id));
            setCommentCount(commentCount);
            console.error('댓글 작성 중 오류:', error);
            alert('댓글 작성에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 댓글 삭제
    const handleDeleteComment = async (commentId: string) => {
        const prevComments = comments;
        const prevCount = commentCount;

        // 낙관적 업데이트
        setComments(prev => prev.filter(c => c.id !== commentId));
        setCommentCount(commentCount - 1);

        try {
            await api.delete(`/posts/${post.id}/comments/${commentId}`);
        } catch (error) {
            // 에러 시 롤백
            setComments(prevComments);
            setCommentCount(prevCount);
            console.error('댓글 삭제 중 오류:', error);
            alert('댓글 삭제에 실패했습니다.');
        }
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
                    <button
                        onClick={handleToggleComments}
                        className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors"
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{commentCount}</span>
                    </button>
                </div>

                {/* 댓글 섹션 */}
                {showComments && (
                    <div className="pt-3 border-t border-border mt-3">
                        {/* 댓글 로딩 */}
                        {isLoadingComments && (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                                댓글을 불러오는 중...
                            </div>
                        )}

                        {/* 댓글 목록 */}
                        {!isLoadingComments && comments.length > 0 && (
                            <div className="space-y-3 mb-3">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-2">
                                        {/* 작성자 아바타 */}
                                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs font-medium flex-shrink-0">
                                            {comment.author.name.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {/* 작성자 이름과 시간 */}
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="text-sm font-medium text-foreground">
                                                    {comment.author.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(comment.createdAt).toLocaleDateString('ko-KR', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            </div>

                                            {/* 댓글 내용 */}
                                            <p className="text-sm text-foreground break-words">
                                                {comment.content}
                                            </p>
                                        </div>

                                        {/* 삭제 버튼 (본인 댓글만) */}
                                        {currentUserId && comment.author.id === currentUserId && (
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                                                aria-label="댓글 삭제"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 댓글 없음 */}
                        {!isLoadingComments && comments.length === 0 && (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                                첫 번째 댓글을 작성해보세요!
                            </div>
                        )}

                        {/* 댓글 작성 폼 (로그인 사용자만) */}
                        {currentUserId && (
                            <form onSubmit={handleSubmitComment} className="flex gap-2 mt-3">
                                <input
                                    type="text"
                                    value={commentInput}
                                    onChange={(e) => setCommentInput(e.target.value)}
                                    placeholder="댓글을 입력하세요..."
                                    className="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="submit"
                                    disabled={!commentInput.trim() || isSubmitting}
                                    className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    aria-label="댓글 전송"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        )}

                        {/* 비로그인 사용자 안내 */}
                        {!currentUserId && (
                            <div className="text-center py-3 text-muted-foreground text-sm">
                                댓글을 작성하려면 로그인하세요.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
