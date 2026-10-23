import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import authService from '../services/authService';

/**
 * ProtectedRoute - Role-based access control wrapper
 * 
 * @param {string[]} allowedRoles - Array of roles permitted to access these routes (e.g., ['MANAGER', 'ADMIN'])
 * 
 * Security Model:
 * 1. If not authenticated → redirect to /login
 * 2. If authenticated but role not allowed → redirect to role's home
 *    - MANAGER/ADMIN → /
 *    - COLLECTOR → /collector/tasks
 * 3. If authenticated and role allowed → render child routes
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
    const token = localStorage.getItem('token');
    const user = authService.getCurrentUser();

    // Check authentication: both valid token and user profile must exist
    if (!token || !user) {
        if (!token && user) localStorage.removeItem('user');
        if (token && !user) localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }

    // Check role-based authorization
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    // User is authenticated and authorized - render child routes
    return <Outlet />;
};

export default ProtectedRoute;
