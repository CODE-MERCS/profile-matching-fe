import React, { useState } from 'react';
import { DUMMY_CREDENTIALS } from '../../../utils/dummyAuth';

const DevHelper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-lg p-4 border border-neutral-200 w-80">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-neutral-900">Dev Helper</h3>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-neutral-500 hover:text-neutral-800"
            >
              ✕
            </button>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium text-sm text-neutral-700 mb-1">Dummy Credentials:</h4>
            <div className="text-sm bg-neutral-100 p-2 rounded">
              <p><span className="font-medium">Email:</span> {DUMMY_CREDENTIALS.email}</p>
              <p><span className="font-medium">Password:</span> {DUMMY_CREDENTIALS.password}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium text-sm text-neutral-700 mb-1">Local Storage:</h4>
            <div className="text-sm">
              <p><span className="font-medium">Token:</span> {localStorage.getItem('token') ? '✓ Present' : '✗ Missing'}</p>
              <p><span className="font-medium">User:</span> {localStorage.getItem('user') ? '✓ Present' : '✗ Missing'}</p>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
              }} 
              className="mt-2 text-xs bg-danger-100 text-danger-700 px-2 py-1 rounded"
            >
              Clear Auth Data
            </button>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-neutral-700 mb-1">Actions:</h4>
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => {
                  window.location.href = '/';
                }}
                className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded"
              >
                Go to Login
              </button>
              <button
                onClick={() => {
                  window.location.href = '/dashboard';
                }}
                className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-neutral-800 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
        >
          🛠️
        </button>
      )}
    </div>
  );
};

export default DevHelper;