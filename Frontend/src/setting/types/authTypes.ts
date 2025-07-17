export interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
}

export interface User {
    id: string;
    name: string;
    email: string;
    roles: string[];
}

export interface LoginPayload {
    username: string | '';
    password: string | '';
}
