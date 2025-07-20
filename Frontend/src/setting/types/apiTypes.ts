export interface ApiResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
}

export interface AppSettings {
    theme: 'light' | 'dark';
    notifications: boolean;
}
