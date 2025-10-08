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
import DiscountPage from '../pages/admin/discount/DiscountPage';
import TourPage from '../pages/admin/tour/TourPage';
import ReviewPage from '../pages/admin/review/ReviewPage';
import BookingPage from '../pages/admin/booking/BookingPage';


// User Pages
import Home from '../pages/user/Home';
import CheckinPage from '../pages/user/CheckinPage';
import Profile from '../pages/user/Profile';
import About from '../pages/user/About';
import TourDetail from '../pages/user/TourDetail';
import BookingHistory from '../pages/user/BookingHistory';
import Contact from '../pages/user/Contact';
import Destinations from '../pages/user/Destinations';
import BookingSuccess from '../pages/user/BookingSuccess';
import BookingCancel from '../pages/user/BookingCancel';

//Auth
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';



function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* User Routes */}
                <Route element={<UserLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/tours/:slug" element={<TourDetail />} />
                    <Route path="/booking-history" element={<BookingHistory />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path='/destinations' element={<Destinations />} />
                    <Route path="/bookings/paypal-success" element={<BookingSuccess />} />
                    <Route path="/bookings/paypal-cancel" element={<BookingCancel />} />
                    <Route path="/checkin/:bookingId" element={<CheckinPage />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="" element={<Dashboard />} />
                    <Route path="roles" element={<RolePage />} />
                    <Route path="users" element={<UserPage />} />
                    <Route path="contacts" element={<ContactPage />} />
                    <Route path="discounts" element={<DiscountPage />} />
                    <Route path="tours" element={<TourPage />} />
                    <Route path="reviews" element={<ReviewPage />} />
                    <Route path="bookings" element={<BookingPage />} />
                    
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />

                {/* User Routes */}
                <Route element={<AuthLayout />}>
                    <Route path="/auth/login" element={<LoginPage />} />
                    <Route path="/auth/register" element={<RegisterPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
