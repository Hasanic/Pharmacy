export interface Product {
    _id: string;
    name: string;
    category_id: string;
    supplier_id: string;
    price: number;
    unit: string;
    stock_quantity?: number;
    expiry_date?: Date | null;
    description?: string;
    type?: 'Medicine' | 'Equipment' | 'Supplement' | 'Other';
    image?: string | null;
    user_id?: string | null;
    unique_id?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IProduct extends Product {
    status?: string;
    priceSale?: number | null;
    category?: {
        _id: string;
        name: string;
    };
    supplier?: {
        _id: string;
        name: string;
    };
}

export interface APIResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: any;
    request?: any;
}

export interface ProductListResponse {
    products?: Product[];
}

export interface SingleProductResponse {
    product?: Product;
}

export interface CreateProductPayload {
    name: string;
    category_id: string;
    supplier_id: string;
    price: number;
    unit: string;
    stock_quantity?: number;
    expiry_date?: Date | null;
    description?: string;
    type?: 'Medicine' | 'Equipment' | 'Supplement' | 'Other';
    image?: string | null;
    user_id?: string | null;
}

export interface ProductResponse {
    success?: boolean;
    code: number;
    status: string;
    data: Product;
}

export interface ProductErrorResponse {
    success?: boolean;
    code: number;
    status: string;
    message: string;
    error?: string;
}
