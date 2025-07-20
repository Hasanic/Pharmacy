import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import apiConfig from './types/apiConfig';
import { getAuthToken, clearAuthToken } from './utils/tokenUtils';

const apiClient: AxiosInstance = axios.create(apiConfig);

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAuthToken();

        if (token && !config.url?.includes('/auth/')) {
            const updatedConfig = {
                ...config,
                headers: {
                    ...config.headers,
                    Authorization: `Bearer ${token}`
                }
            } as InternalAxiosRequestConfig;

            return updatedConfig;
        }

        return config as InternalAxiosRequestConfig;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            clearAuthToken();
            window.location.href = '/login?sessionExpired=true';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
