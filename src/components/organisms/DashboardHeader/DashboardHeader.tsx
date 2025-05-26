// src/components/organisms/DashboardHeader/DashboardHeader.tsx
import React from 'react';

interface DashboardHeaderProps {
  title: string;
  userName?: string;
  userRole?: string;
  onMenuToggle: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  title, 
  userName = 'Admin', 
  userRole = 'Administrator',
  onMenuToggle
}) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="flex justify-between items-center px-4 py-4">
        <div className="flex items-center">
          <button 
            onClick={onMenuToggle}
            className="mr-4 md:hidden text-neutral-600 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-neutral-800">
            {title}
          </h1>
        </div>
        <div className="flex items-center">
          <div className="mr-4 text-right hidden sm:block">
            <div className="text-sm font-medium text-neutral-800">{userName}</div>
            <div className="text-xs text-neutral-500">{userRole}</div>
          </div>
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700">
            <span className="font-medium">{userName.charAt(0)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;