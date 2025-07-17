import { Navigate, Route, Routes } from 'react-router-dom';
import React, { ReactElement } from 'react';
import DashboardLayout from '@/layouts/dashboard';
import LogoOnlyLayout from '@/layouts/LogoOnlyLayout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import DashboardApp from '@/pages/DashboardApp';
import Products from '@/pages/Products';
import User from '@/pages/User';
import NotFound from '@/pages/Page404';

export const Router = (): ReactElement => {
    return (
        <Routes>
            <Route path="/dashboard" element={<DashboardLayout />}>
                <Route path="" element={<Navigate to="/dashboard/app" replace />} />
                <Route path="app" element={<DashboardApp />} />
                <Route path="user" element={<User />} />
                <Route path="products" element={<Products />} />
            </Route>

            <Route path="/" element={<LogoOnlyLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="404" element={<NotFound />} />
                <Route path="" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
};

export default Router;
