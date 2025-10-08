import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from '../layouts/AdminLayout';
import UserLayout from '../layouts/UserLayout';

// Admin Pages
import Dashboard from '../pages/admin/Dashboard';

// User Pages
import Home from '../pages/user/Home';

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
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
