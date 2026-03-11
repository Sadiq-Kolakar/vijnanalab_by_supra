import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('Student' | 'Teacher')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    // Simple mock protection logic - in a real app, this would check auth state
    const isAuthenticated = true; // Placeholder

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
