// src/components/atoms/Toast/Toast.tsx
import React, { useEffect, useState } from 'react';

interface ToastProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  type,
  message,
  onClose,
  duration = 4000
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation before removing
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  const getIconByType = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  const getToastStyles = () => {
    const baseStyles = "shadow-lg border rounded-lg fixed z-50 transition-all duration-300";
    const visibilityStyles = isVisible 
      ? "opacity-100 transform translate-y-0" 
      : "opacity-0 transform translate-y-2";
    const positionStyles = "bottom-4 right-4"; // Positioned at bottom right
    
    switch (type) {
      case 'success':
        return `${baseStyles} ${visibilityStyles} ${positionStyles} bg-green-50 border-green-200`;
      case 'error':
        return `${baseStyles} ${visibilityStyles} ${positionStyles} bg-red-50 border-red-200`;
      default:
        return `${baseStyles} ${visibilityStyles} ${positionStyles} bg-white border-gray-200`;
    }
  };
  
  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };
  
  return (
    <div className={getToastStyles()} style={{ width: '400px', maxWidth: 'calc(100vw - 2rem)' }}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIconByType()}
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${getTextColor()}`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="relative h-1 w-full bg-gray-200 rounded-b-lg overflow-hidden">
        <div 
          className={`absolute bottom-0 left-0 h-full ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ 
            width: '100%',
            animation: `shrinkWidth ${duration}ms linear forwards`
          }}
        ></div>
      </div>
      
      <style>
        {`
          @keyframes shrinkWidth {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>
    </div>
  );
};

export default Toast;