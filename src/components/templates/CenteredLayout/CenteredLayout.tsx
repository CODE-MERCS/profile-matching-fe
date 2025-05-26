import React from 'react';

interface CenteredLayoutProps {
  children: React.ReactNode;
}

const CenteredLayout: React.FC<CenteredLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-neutral-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
};

export default CenteredLayout;