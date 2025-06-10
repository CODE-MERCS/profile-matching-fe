import React from 'react';
import LoginForm from '../../molecules/LoginForm/LoginForm';
import logo from '/img/logo33.jpg'; // Sesuaikan path sesuai lokasi file logo

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
          {/* Ganti dengan logo */}
          <img src={logo} alt="Logo" className="w-30 h-28 rounded-full" />
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