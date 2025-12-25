// 토큰 관리
const ACCESS_TOKEN_KEY = 'hoochoo_access_token';
const REFRESH_TOKEN_KEY = 'hoochoo_refresh_token';
const USER_KEY = 'hoochoo_user';

export function setTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
}

export function getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
}

export function getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
}

export function clearTokens() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }
}

export function setUser(user: any) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
}

export function getUser(): any | null {
    if (typeof window !== 'undefined') {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    }
    return null;
}

export function isAuthenticated(): boolean {
    return !!getAccessToken();
}

export function logout() {
    clearTokens();
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
}
