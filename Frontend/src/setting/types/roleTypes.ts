export interface Role {
    _id: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateRolePayload {
    name: string;
}

export interface RoleResponse {
    success: boolean;
    data: {
        name: string;
        _id?: string;
    };
}

export interface RoleErrorResponse {
    success: boolean;
    message: string;
    error?: string;
}
