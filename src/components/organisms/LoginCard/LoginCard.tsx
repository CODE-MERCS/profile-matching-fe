import React from 'react';
import LoginForm from '../../molecules/LoginForm/LoginForm';

interface LoginCardProps {
  onLogin: (email: string, password: string) => Promise<void>;
  error: string;
  isLoading: boolean;
}

const LoginCard: React.FC<LoginCardProps> = ({ onLogin, error, isLoading }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full">
      <div className="text-center mb-8">
        <div className="mb-4 flex justify-center">
          {/* You can add your logo here */}
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">PM</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">Profile Matching</h1>
        <p className="text-neutral-600 mt-1">Sign in to your account</p>
      </div>
      
      <LoginForm
        onSubmit={onLogin}
        error={error}
        isLoading={isLoading}
      />
      
      <div className="mt-6 pt-6 border-t border-neutral-200 text-center text-sm text-neutral-600">
        <p>© 2025 Profile Matching System. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LoginCard;