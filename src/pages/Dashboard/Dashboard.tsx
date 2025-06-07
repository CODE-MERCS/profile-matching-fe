// src/pages/Dashboard/Dashboard.tsx (bagian import dan case)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/organisms/Sidebar/Sidebar';
import DashboardLayout from '../../components/templates/DashboardLayout/DashboardLayout';
import DataPekerjaan from '../DataPekerjaan/DataPekerjaan';
import DataPelamar from '../DataPelamar/DataPelamar';
import DataSubKriteria from '../DataSubKriteria/DataSubKriteria';
import DataKriteria from '../DataKriteria/DataKriteria';
import ProsesProfileMatching from '../ProsesProfileMatching/ProsesProfileMatching';
import HasilPerhitungan from '../HasilPerhitungan/HasilPerhitungan'; // Import baru
import GantiPassword from '../GantiPassword/GantiPassword';
import authService from '../../utils/dummyAuth';
import { setAuthHeader } from '../../middleware/authMiddleware';

// Define menu items with icons (icons are now handled in MenuItem component)
const menuItems = [
  { id: 'home', label: 'Home' },
  { id: 'data-pekerjaan', label: 'Data Pekerjaan' },
  { id: 'data-pelamar', label: 'Data Pelamar' },
  { id: 'data-kriteria', label: 'Data Kriteria Penilaian' },
  { id: 'data-subkriteria', label: 'Data Subkriteria' },
  { id: 'proses-matching', label: 'Proses Profile Matching' },
  { id: 'hasil-perhitungan', label: 'Hasil Perhitungan' },
  { id: 'ganti-password', label: 'Ganti Password' },
];

// Dashboard stats for home page
const dashboardStats = [
  { id: 'pelamar', label: 'Data Pelamar', value: 24, description: 'Total pelamar terdaftar', color: 'primary' },
  { id: 'matching', label: 'Proses Matching', value: 12, description: 'Pelamar telah diproses', color: 'green' },
  { id: 'lowongan', label: 'Lowongan', value: 5, description: 'Posisi pekerjaan tersedia', color: 'amber' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('home');
  const [user, setUser] = useState({ name: 'Admin', role: 'Administrator' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Toggle sidebar visibility (for mobile)
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Close sidebar when menu item is clicked (on mobile)
  const handleMenuClick = (id: string) => {
    setActiveMenuItem(id);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };
  
  // Get user data from localStorage if available
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser({
          name: userData.name || 'Admin',
          role: userData.role || 'Administrator'
        });
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
  }, []);
  
  const handleLogout = () => {
    authService.logout();
    setAuthHeader(null);
    navigate('/');
  };
  
  // Get current page title based on active menu
  const getCurrentTitle = () => {
    const menuItem = menuItems.find(item => item.id === activeMenuItem);
    return menuItem ? menuItem.label : 'Dashboard';
  };
  
  // Render appropriate content based on active menu
  const renderContent = () => {
    switch (activeMenuItem) {
      case 'home':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-contain bg-right-top bg-no-repeat opacity-10" 
                   style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'600\' height=\'600\' viewBox=\'0 0 600 600\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg transform=\'translate(300,300)\'%3E%3Cpath d=\'M153,-230.8C204,-205.3,254.8,-179.5,268.7,-139C282.5,-98.6,259.4,-43.4,247.3,8.4C235.3,60.2,234.3,108.5,213.6,148.8C192.9,189.1,152.4,221.2,107.5,233.4C62.6,245.6,13.2,237.8,-30.3,221.6C-73.8,205.4,-111.4,180.8,-149.8,153.1C-188.2,125.4,-227.4,94.7,-245.8,54.2C-264.3,13.7,-262,-36.6,-242.2,-77.7C-222.3,-118.9,-184.8,-150.9,-143.3,-179.9C-101.7,-208.9,-56.1,-234.9,-5.8,-227.2C44.5,-219.5,102,-256.3,153,-230.8Z\' fill=\'%234299e1\' /%3E%3C/g%3E%3C/svg%3E")' }}></div>
              <h2 className="text-xl md:text-2xl font-bold text-neutral-800 mb-2 md:mb-4 relative z-10">
                Selamat Datang di Aplikasi SPK Penerimaan Karyawan Baru
              </h2>
              <h3 className="text-lg md:text-xl text-neutral-600 mb-4 md:mb-6 relative z-10">dengan Metode Profile Matching</h3>
              
              <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative z-10">
                {dashboardStats.map((stat) => (
                  <div key={stat.id} className={`bg-${stat.color}-50 rounded-lg p-4 md:p-6 border border-${stat.color}-100 transition-all hover:shadow-md`}>
                    <div className={`text-${stat.color}-700 text-base md:text-lg font-medium mb-2`}>{stat.label}</div>
                    <div className={`text-2xl md:text-3xl font-bold text-${stat.color}-800`}>{stat.value}</div>
                    <div className={`text-${stat.color}-600 text-xs md:text-sm mt-2`}>{stat.description}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 md:mt-8 p-4 md:p-6 bg-neutral-50 rounded-lg border border-neutral-200 relative z-10">
                <h3 className="font-medium text-neutral-800 mb-2 md:mb-3">Tentang Aplikasi</h3>
                <p className="text-neutral-600 text-sm md:text-base">
                  Sistem Pendukung Keputusan (SPK) Penerimaan Karyawan Baru ini menggunakan metode Profile Matching 
                  untuk membantu proses seleksi karyawan. Metode ini membandingkan antara profil pelamar dengan 
                  profil jabatan yang dibutuhkan sehingga dapat memperoleh informasi mengenai perbedaan kompetensinya.
                </p>
              </div>
            </div>
          </div>
        );
      case 'data-pekerjaan':
        return <DataPekerjaan />;
      case 'data-pelamar':
        return <DataPelamar />;
      case 'data-kriteria':
        return <DataKriteria />;
      case 'data-subkriteria':
        return <DataSubKriteria />;
      case 'proses-matching':
        return <ProsesProfileMatching />;
      case 'hasil-perhitungan':
        return <HasilPerhitungan />; // Tambahkan case baru
      case 'ganti-password':
        return <GantiPassword />;
      default:
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in">
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-neutral-200 rounded-lg">
              <div className="text-center">
                <h3 className="text-lg font-medium text-neutral-700 mb-2">
                  Konten {getCurrentTitle()}
                </h3>
                <p className="text-neutral-500">
                  Halaman ini sedang dalam pengembangan.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden">
      <Sidebar
        items={menuItems}
        activeItemId={activeMenuItem}
        onItemClick={handleMenuClick}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />
      
      <DashboardLayout
        title={getCurrentTitle()}
        userName={user.name}
        userRole={user.role}
        onMenuToggle={toggleSidebar}
      >
        {renderContent()}
      </DashboardLayout>
    </div>
  );
};

export default Dashboard;