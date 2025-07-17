import { getAuthToken } from '@/setting/utils/tokenUtils';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// const isAuthenticated = (): boolean => {
//     return !!localStorage.getItem('token');
// };

const RequireAuth = ({ children }: { children: JSX.Element }) => {
    const location = useLocation();

    if (!getAuthToken()) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default RequireAuth;
