import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/user';
import Loader from '../components/common/Loader';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader label="Checking session..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
