import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="bg-danger-50 text-danger-700 p-3 rounded-md mb-4">
      {message}
    </div>
  );
};

export default ErrorMessage;