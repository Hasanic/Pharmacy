import apiClient from './apiClient';
import { AppSettings } from './types/apiTypes';
import { createMember } from './types/memberTypes';
import { Role } from './types/roleTypes';
import { RegisterUser } from './types/UserTypes';

interface LoginPayload {
    username: string;
    password: string;
}

interface ApiResponse<T> {
    data: T;
    status: number;
    statusText: string;
}

const API = {
    auth: {
        login: (
            payload: LoginPayload
        ): Promise<ApiResponse<{ token: string; user: RegisterUser }>> =>
            apiClient.post('/login', payload),
        logout: (): Promise<ApiResponse<void>> => apiClient.post('/auth/logout')
    },
    users: {
        create: (data: RegisterUser): Promise<ApiResponse<RegisterUser>> =>
            apiClient.post('/user', data),

        getAll: (
            page?: number
        ): Promise<
            ApiResponse<{
                page: number;
                rows: number;
                pages: number;
                pageSize: number;
                data: RegisterUser[];
            }>
        > => apiClient.get('/user/getAllUsers', { params: { page } }),

        getById: (userId: string): Promise<ApiResponse<RegisterUser>> =>
            apiClient.get(`/users/${userId}`),

        updateUser: (
            userId: string,
            data: Partial<RegisterUser>
        ): Promise<ApiResponse<RegisterUser>> => apiClient.put(`/users/${userId}`, data),

        delete: (userId: string): Promise<ApiResponse<void>> => apiClient.delete(`/users/${userId}`)
    },
    roles: {
        getAll: (
            page = 1 // Default to page 1
        ): Promise<
            ApiResponse<{
                page: number;
                rows: number;
                pages: number;
                pageSize: number;
                data: Role[];
            }>
        > =>
            apiClient.get('/roles/getAllroless', {
                params: {
                    page: Number.isInteger(page) ? page : 1 // Ensure page is a valid number
                }
            })
    }
    // roles: {
    //     getAll: (
    //         page?: number
    //     ): Promise<
    //         ApiResponse<{
    //             page: number;
    //             rows: number;
    //             pages: number;
    //             pageSize: number;
    //             data: Role[];
    //         }>
    //     > => apiClient.get('/roles/getAllroless', { params: { page } })
    // }
};

export default API;
