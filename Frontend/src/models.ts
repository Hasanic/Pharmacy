export interface IUser {
    id: string;
    username: string;
    role?: {
        _id: string;
        name: string;
    };
}

export interface IPost {
    id: string;
    cover: string;
    title: string;
    view: number;
    comment: number;
    share: number;
    favorite: number;
    createdAt: Date;
    author: {
        name: string;
        avatarUrl: string;
    };
}
export interface IAccount {
    _id: string;
    username: string;
    name?: string;
    role?: string;
    photoURL: string;
    user_id: string | null;
    [key: string]: any; // for additional token claims
}

export interface IProduct {
    _id: string;
    name: string;
    price: number;
    unit: string;
    status?: string; // UI-specific field
    priceSale?: number | null; // UI-specific field

    // API fields (can be string or object)
    category_id: string | { _id: string; name: string };
    supplier_id: string | { _id: string; name: string };

    // Optional fields
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
export interface NavItemConfig {
    title: string;
    path: string;
    icon: JSX.Element;
    info?: string;
    children?;
}

export interface News {
    image;
    title;
    description;
    postedAt;
}

export interface Site {
    icon;
    value;
    name;
}

export interface HeaderLabel {
    id: string;
    label: string;
    alignRight: boolean;
}
