// export interface Product {
//     status: string;
//     priceSale: null;
//     _id: string;
//     name: string;
//     category_id: string;
//     supplier_id: string;
//     price: number;
//     unit: string;
//     stock_quantity?: number;
//     expiry_date?: Date | null;
//     description?: string;
//     type?: 'Medicine' | 'Equipment' | 'Supplement' | 'Other';
//     image?: string | null;
//     user_id?: string | null;
//     unique_id?: number;
//     createdAt?: Date;
//     updatedAt?: Date;
// }

// export interface CreateProductPayload {
//     name: string;
//     category_id: string;
//     supplier_id: string;
//     price: number;
//     unit: string;
//     stock_quantity?: number;
//     expiry_date?: Date | null;
//     description?: string;
//     type?: 'Medicine' | 'Equipment' | 'Supplement' | 'Other';
//     image?: string | null;
//     user_id?: string | null;
// }

// export interface ProductResponse {
//     success?: boolean;
//     code: number;
//     status: string;
//     data: Product;
// }

// export interface ProductErrorResponse {
//     success?: boolean;
//     code: number;
//     status: string;
//     message: string;
//     error?: string;
// }

// Base product interface that matches your API response

export interface Product {
    _id: string;
    name: string;
    category_id: string; // From API
    supplier_id: string; // From API
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

// Extended interface for UI with additional fields
export interface IProduct extends Product {
    // Add UI-specific fields
    status?: string;
    priceSale?: number | null;
    // Add populated fields as objects
    category?: {
        _id: string;
        name: string;
    };
    supplier?: {
        _id: string;
        name: string;
    };
}

// API Response Types
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
