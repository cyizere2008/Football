import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, 
  FiUsers, 
  FiUserCheck, 
  FiCalendar, 
  FiDollarSign, 
  FiBarChart2,
  FiLogOut,
  FiActivity
} from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', name: 'Dashboard', icon: FiHome },
    { path: '/players', name: 'Players', icon: FiUsers },
    { path: '/coaches', name: 'Coaches', icon: FiUserCheck },
    { path: '/matches', name: 'Matches', icon: FiCalendar },
    { path: '/attendance', name: 'Attendance', icon: FiActivity },
    { path: '/training', name: 'Training', icon: FiActivity },
    { path: '/finance', name: 'Finance', icon: FiDollarSign },
    { path: '/reports', name: 'Reports', icon: FiBarChart2 },
  ];

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">⚽ Football Club Manager</div>
          </div>
          
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-1 hover:text-blue-200 transition"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              {user?.username} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;