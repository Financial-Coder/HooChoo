// API 타입 정의
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'MEMBER';
    avatarUrl: string | null;
    createdAt: string;
}

export interface Post {
    id: string;
    type: 'IMAGE' | 'VIDEO';
    caption: string | null;
    media: MediaAsset;
    author: Author;
    _count: {
        likes: number;
        comments: number;
    };
    isLikedByMe: boolean;
    isPublished: boolean;
    createdAt: string;
}

export interface MediaAsset {
    originalUrl: string;
    thumbnailUrl: string;
    width: number;
    height: number;
    durationMs?: number | null;
}

export interface Author {
    id: string;
    name: string;
    avatarUrl: string | null;
}

export interface Comment {
    id: string;
    postId: string;
    author: Author;
    content: string;
    createdAt: string;
    editedAt: string | null;
}

export interface Invitation {
    id: string;
    code: string;
    email: string | null;
    role: 'ADMIN' | 'MEMBER';
    expiresAt: string | null;
    createdAt: string;
    createdById: string;
    acceptedUserId: string | null;
}

// API 응답 타입
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface PostListResponse {
    data: Post[];
    nextCursor: string | null;
}

export interface CommentListResponse {
    data: Comment[];
    nextCursor: string | null;
}

// API 요청 타입
export interface LoginRequest {
    email: string;
    password: string;
}

export interface InvitationAcceptRequest {
    code: string;
    name: string;
    email: string;
    password: string;
}

export interface PostCreateRequest {
    type: 'IMAGE' | 'VIDEO';
    caption?: string;
    file: File;
}
