// src/components/atoms/Input/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  appendIcon?: React.ReactNode; // New prop for append icon
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  id,
  className = '',
  appendIcon,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${props.disabled ? 'bg-gray-100' : 'bg-white'} ${className}`}
          {...props}
        />
        {appendIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            {appendIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;