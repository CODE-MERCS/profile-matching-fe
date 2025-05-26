// src/components/templates/DashboardLayout/DashboardLayout.tsx
import React, { ReactNode } from 'react';
import DashboardHeader from '../../organisms/DashboardHeader/DashboardHeader';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  userName?: string;
  userRole?: string;
  onMenuToggle: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title, 
  userName, 
  userRole,
  onMenuToggle
}) => {
  return (
    <div className="flex-1 overflow-auto flex flex-col h-screen">
      <DashboardHeader 
        title={title} 
        userName={userName} 
        userRole={userRole}
        onMenuToggle={onMenuToggle}
      />
      <main className="flex-1 p-4 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;