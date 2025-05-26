import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '../middleware/authMiddleware';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - Login as main page */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Login />} />
        </Route>
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add other protected routes here */}
        </Route>
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;