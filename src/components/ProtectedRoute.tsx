import React from 'react';
import { Navigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useConfig();
  
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/admin-login" replace />;
  }
  
  return <>{children}</>;
}

export default ProtectedRoute;