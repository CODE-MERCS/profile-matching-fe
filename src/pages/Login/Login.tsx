import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CenteredLayout from '../../components/templates/CenteredLayout/CenteredLayout';
import LoginCard from '../../components/organisms/LoginCard/LoginCard';
import { authService } from '../../services/authService';
import { setAuthHeader } from '../../middleware/authMiddleware';

const Login: React.FC = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if already logged in on component mount
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authService.login({ email, password });
      console.log('Login response:', response); // Debug log
      
      // Store the token
      setAuthHeader(response.data.token);
      
      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err); // Debug log
      setError(err.message || 'Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CenteredLayout>
      <div className="w-full max-w-md">
        <LoginCard
          onLogin={handleLogin}
          error={error}
          isLoading={isLoading}
        />
      </div>
    </CenteredLayout>
  );
};

export default Login;