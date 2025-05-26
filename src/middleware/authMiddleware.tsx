import { Navigate, Outlet } from 'react-router-dom';
import authService from '../services/auth/authService';

// Protected route middleware
export const ProtectedRoute = () => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

// Public route middleware (for routes like login that should be inaccessible when logged in)
export const PublicRoute = () => {
  if (authService.isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};

// Auth header middleware for API requests
export const setAuthHeader = (token: string | null): void => {
  if (token) {
    // Set for fetch
    window.localStorage.setItem('token', token);
  } else {
    // Remove if token is null (logout)
    window.localStorage.removeItem('token');
  }
};