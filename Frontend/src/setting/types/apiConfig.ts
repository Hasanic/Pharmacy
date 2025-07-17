interface ApiConfig {
    baseURL: string;
    headers: Record<string, string>;
    timeout?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const config: ApiConfig = {
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
};

export default config;
