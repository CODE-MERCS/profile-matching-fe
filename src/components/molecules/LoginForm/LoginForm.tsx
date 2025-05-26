import React, { useState } from 'react';
import Input from '../../atoms/Input/Input';
import Button from '../../atoms/Button/Button';
import ErrorMessage from '../../atoms/ErrorMessage/ErrorMessage';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  error: string;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, error, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });
  
  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: '',
    };
    
    // Simple validation
    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }
    
    setFormErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(email, password);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <ErrorMessage message={error} />
      
      <Input
        id="email"
        type="email"
        label="Email Address"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={formErrors.email}
        autoComplete="email"
        required
      />
      
      <Input
        id="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={formErrors.password}
        autoComplete="current-password"
        required
      />
      
      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        className="w-full mt-2"
      >
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;