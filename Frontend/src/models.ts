export interface IUser {
    // username: string;
    // id: string;
    // avatarUrl: string;
    // name: string;
    // company: string;
    // isVerified: boolean;
    // status: string | undefined;
    // role: string | undefined;
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
// export interface IAccount {
//     // username: string;
//     // email: string;
//     // role: string | undefined;
//     _id: string;
//     photoURL: string;
//     name: string;
//     user_id: null | string;
// }

export interface IProduct {
    id: string;
    // cover: string;
    name: string;
    price: number;
    priceSale: number | null;
    colors: string[];
    status: string | undefined;
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
