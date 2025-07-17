// interface DecodedToken {
//     exp?: number;
//     iat?: number;
//     [key: string]: any;
// }

// export const getAuthToken = (): string | null => {
//     return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
// };

// export const setAuthToken = (token: string, rememberMe: boolean): void => {
//     if (rememberMe) {
//         localStorage.setItem('authToken', token);
//     } else {
//         sessionStorage.setItem('authToken', token);
//     }
// };

// export const clearAuthToken = (): void => {
//     localStorage.removeItem('authToken');
//     sessionStorage.removeItem('authToken');
// };

// export const decodeToken = (token: string | null): DecodedToken | null => {
//     if (!token) return null;

//     try {
//         const base64Url = token.split('.')[1];
//         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//         return JSON.parse(atob(base64)) as DecodedToken;
//     } catch (e) {
//         console.error('Error decoding token:', e);
//         return null;
//     }
// };

// export const isTokenExpired = (token: string | null): boolean => {
//     const decoded = decodeToken(token);
//     if (!decoded?.exp) return true;
//     return Date.now() >= decoded.exp * 1000;
// };

export interface DecodedToken {
    exp?: number;
    iat?: number;
    username?: string;
    name?: string;
    role?: string;
    picture?: string;
    [key: string]: any;
}

export const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

export const setAuthToken = (token: string, rememberMe: boolean): void => {
    if (rememberMe) {
        localStorage.setItem('authToken', token);
    } else {
        sessionStorage.setItem('authToken', token);
    }
};

export const clearAuthToken = (): void => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
};

export const decodeToken = (token: string | null): DecodedToken | null => {
    if (!token) return null;

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64)) as DecodedToken;
    } catch (e) {
        console.error('Error decoding token:', e);
        return null;
    }
};

export const isTokenExpired = (token: string | null): boolean => {
    const decoded = decodeToken(token);
    if (!decoded?.exp) return true;
    return Date.now() >= decoded.exp * 1000;
};

export const isValidToken = (token: string | null): boolean => {
    if (!token) return false;
    return !isTokenExpired(token);
};
