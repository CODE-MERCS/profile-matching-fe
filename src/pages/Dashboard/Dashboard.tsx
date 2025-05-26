import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/atoms/Button/Button';
// import authService from '../../services/auth/authService';
import { setAuthHeader } from '../../middleware/authMiddleware';
import authService from '../../utils/dummyAuth';

interface User {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({});
  
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
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
  
  return (
    <div className="min-h-screen bg-neutral-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white shadow-sm rounded-lg p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">PM</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900">Profile Matching System</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </header>
        
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mr-4">
              <span className="text-xl font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-medium text-neutral-900">{user.name || 'User'}</h2>
              <p className="text-neutral-600">{user.email || 'No email available'}</p>
              <p className="text-sm text-primary-600 mt-1">{user.role || 'User'}</p>
            </div>
          </div>
          
          <div className="p-4 bg-primary-50 rounded-lg">
            <p className="text-primary-800">
              Welcome to the Profile Matching Dashboard. From here you can manage profiles, view matches, and more.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white shadow-sm rounded-lg p-4">
            <h3 className="font-medium text-neutral-900 mb-2">Recent Matches</h3>
            <p className="text-neutral-600 text-sm">No recent matches found.</p>
          </div>
          <div className="bg-white shadow-sm rounded-lg p-4">
            <h3 className="font-medium text-neutral-900 mb-2">Your Profile</h3>
            <p className="text-neutral-600 text-sm">Complete your profile to improve matching.</p>
          </div>
          <div className="bg-white shadow-sm rounded-lg p-4">
            <h3 className="font-medium text-neutral-900 mb-2">Activity</h3>
            <p className="text-neutral-600 text-sm">No recent activity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;