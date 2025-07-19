import apiClient from './apiClient';
import { Role } from './types/roleTypes';
import { RegisterUser } from './types/UserTypes';
import { Product, CreateProductPayload } from './types/productTypes';

interface LoginPayload {
    username: string;
    password: string;
}

interface ApiResponse<T> {
    data: T;
    status: number;
    statusText: string;
}

interface PaginatedResponse<T> {
    page: number;
    rows: number;
    pages: number;
    pageSize: number;
    data: T[];
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

        getAll: (page?: number): Promise<ApiResponse<PaginatedResponse<RegisterUser>>> =>
            apiClient.get('/user/getAllUsers', { params: { page } }),

        getById: (userId: string): Promise<ApiResponse<RegisterUser>> =>
            apiClient.get(`/users/${userId}`),

        updateUser: (
            userId: string,
            data: Partial<RegisterUser>
        ): Promise<ApiResponse<RegisterUser>> => apiClient.put(`/users/${userId}`, data),

        delete: (userId: string): Promise<ApiResponse<void>> => apiClient.delete(`/users/${userId}`)
    },
    roles: {
        getAll: (page = 1): Promise<ApiResponse<PaginatedResponse<Role>>> =>
            apiClient.get('/roles/getAllroless', {
                params: {
                    page: Number.isInteger(page) ? page : 1
                }
            })
    },
    products: {
        create: (data: FormData | CreateProductPayload): Promise<ApiResponse<Product>> =>
            apiClient.post('/products', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }),

        getAll: (): Promise<ApiResponse<Product[]>> => apiClient.get('/products'),

        getById: (productId: string): Promise<ApiResponse<Product>> =>
            apiClient.get(`/products/${productId}`),

        update: (
            productId: string,
            data: Partial<CreateProductPayload>
        ): Promise<ApiResponse<Product>> => apiClient.put(`/products/${productId}`, data),

        delete: (productId: string): Promise<ApiResponse<void>> =>
            apiClient.delete(`/products/${productId}`)
    },
    categories: {
        getAll: (
            page = 1
        ): Promise<ApiResponse<PaginatedResponse<{ _id: string; name: string }>>> =>
            apiClient.get('/category/getAllcategorys', { params: { page } })
    },
    suppliers: {
        getAll: (
            page = 1
        ): Promise<ApiResponse<PaginatedResponse<{ _id: string; name: string }>>> =>
            apiClient.get('/supplier/getAllSuppliers', { params: { page } })
    }
};

export default API;
