import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from '../layouts/AdminLayout';
import UserLayout from '../layouts/UserLayout';
import AuthLayout from '../layouts/AuthLayout';

// Admin Pages
import Dashboard from '../pages/admin/Dashboard';
import RolePage from '../pages/admin/role/RolePage';
import UserPage from '../pages/admin/user/UserPage';
import ContactPage from '../pages/admin/contact/ContactPage';

// User Pages
import Home from '../pages/user/Home';

//Auth
import LoginPage from '../pages/auth/LoginPage';


function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* User Routes */}
                <Route element={<UserLayout />}>
                    <Route path="/" element={<Home />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="roles" element={<RolePage />} />
                    <Route path="users" element={<UserPage />} />
                    <Route path="contacts" element={<ContactPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />

                {/* User Routes */}
                <Route element={<AuthLayout />}>
                    <Route path="/auth/login" element={<LoginPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
