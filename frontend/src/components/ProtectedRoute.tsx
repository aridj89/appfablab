import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: ReactNode;
    adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
    const isAuthenticated = !!localStorage.getItem('access');
    const isStaff = localStorage.getItem('is_staff') === 'true';

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isStaff) {
        return <Navigate to="/labo" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
