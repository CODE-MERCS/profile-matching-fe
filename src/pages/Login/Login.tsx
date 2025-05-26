import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CenteredLayout from '../../components/templates/CenteredLayout/CenteredLayout';
import LoginCard from '../../components/organisms/LoginCard/LoginCard';
// Import from dummyAuth instead of directly from authService
import authService, { DUMMY_CREDENTIALS } from '../../utils/dummyAuth';
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
      
      // Store the token and user data
      setAuthHeader(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
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
        <div className="mt-4 text-center text-sm text-neutral-600">
          <p>Profile Matching System</p>
          
          {/* Add this section to show dummy credentials in development mode */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-neutral-100 rounded-md text-left">
              <p className="font-medium">Dummy Credentials (for testing):</p>
              <p>Email: {DUMMY_CREDENTIALS.email}</p>
              <p>Password: {DUMMY_CREDENTIALS.password}</p>
            </div>
          )}
        </div>
      </div>
    </CenteredLayout>
  );
};

export default Login;