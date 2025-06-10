import React from 'react';
import MenuItem from '../../molecules/MenuItem/MenuItem';
import logo333 from '/img/logo33.jpg'; // Sesuaikan path sesuai lokasi file logo

interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  activeItemId: string;
  onItemClick: (id: string) => void;
  onLogout: () => void;
  title?: string;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  items, 
  activeItemId, 
  onItemClick, 
  onLogout,
  title = 'SPK Profile Matching',
  isOpen,
  onToggle
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={onToggle}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed md:static inset-y-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition duration-200 ease-in-out md:w-72 w-64 bg-white shadow-lg z-30 flex flex-col h-screen`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={logo333} alt="Logo" className="w-10 h-10 mr-2" />
              <h2 className="text-xl font-bold">{title}</h2>
            </div>
            <button 
              onClick={onToggle}
              className="md:hidden text-white focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-1 text-primary-100 text-sm">Sistem Pendukung Keputusan</div>
        </div>
        
        {/* User Profile */}
        <div className="p-4 border-b border-neutral-200 flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mr-3">
            <span className="font-bold">A</span>
          </div>
          <div>
            <div className="font-medium text-neutral-800">Admin</div>
            <div className="text-xs text-neutral-500">Administrator</div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {items.map((item, index) => (
            <div key={item.id} className={index !== 0 ? "mt-1" : ""}>
              <MenuItem
                id={item.id}
                label={item.label}
                isActive={activeItemId === item.id}
                onClick={onItemClick}
                icon={item.icon}
              />
            </div>
          ))}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-neutral-200">
          <button 
            onClick={onLogout}
            className="w-full px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;