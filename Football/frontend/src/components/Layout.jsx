import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define menu items with role-based access
  const menuItems = [
    // Admin only routes
    { name: 'Admin Dashboard', icon: '📊', path: '/dashboard', roles: ['admin'] },
    { name: 'Players', icon: '👥', path: '/players', roles: ['admin', 'coach'] },
    { name: 'Matches', icon: '⚽', path: '/matches', roles: ['admin', 'coach', 'player'] },
    { name: 'Attendance', icon: '✅', path: '/attendance', roles: ['admin', 'coach'] },
    { name: 'Finance', icon: '💰', path: '/finance', roles: ['admin', 'accountant'] },
    { name: 'Reports', icon: '📈', path: '/reports', roles: ['admin', 'accountant', 'coach'] },
    
    // Coach only routes
    { name: 'Coach Dashboard', icon: '🏃', path: '/coach-dashboard', roles: ['coach'] },
    { name: 'Training Sessions', icon: '🏋️', path: '/training-sessions', roles: ['coach'] },
    { name: 'Player Performance', icon: '📊', path: '/player-performance', roles: ['coach'] },
    
    // Accountant only routes
    { name: 'Financial Reports', icon: '💰', path: '/reports', roles: ['accountant'] },
    
    // Player only routes
    { name: 'My Matches', icon: '⚽', path: '/matches', roles: ['player'] },
    { name: 'My Attendance', icon: '✅', path: '/attendance', roles: ['player'] },
    { name: 'My Stats', icon: '📊', path: '/reports', roles: ['player'] },
  ];

  // Filter menu items based on user role
  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  // Get user friendly role name
  const getRoleName = (role) => {
    const roles = {
      admin: '👑 Administrator',
      coach: '🏃 Coach',
      player: '⚽ Player',
      accountant: '💰 Accountant'
    };
    return roles[role] || role;
  };

  // Check if menu item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Handle navigation and close mobile menu
  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-zinc-900">
      {/* Mobile Header - Only visible on mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-800 border-b border-zinc-700 px-4 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚽</span>
          <h1 className="text-lg font-bold text-white">Football Club</h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-zinc-400 hover:text-white p-2 transition-colors"
          aria-label="Toggle menu"
        >
          <span className="text-2xl">{mobileMenuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar - Slide out menu */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-zinc-800 z-50 shadow-xl lg:hidden transform transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl mb-2">⚽</div>
              <h1 className="text-xl font-bold text-white">Football Club</h1>
              <p className="text-xs text-zinc-500 mt-1">Management System</p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Mobile User Info */}
        <div className="p-4 border-b border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-zinc-500 text-xs mt-0.5">
                {getRoleName(user?.role)}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <nav className="flex-1 py-4 overflow-y-auto" style={{ height: 'calc(100% - 240px)' }}>
          {filteredMenu.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-blue-500/10 border-l-4 border-blue-500 text-blue-400'
                  : 'text-zinc-500 hover:bg-zinc-700/30 hover:text-zinc-200'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Mobile Logout Button - Positioned near bottom */}
        <div className="absolute bottom-8 left-0 right-0 px-4">
          <button
            onClick={() => {
              logout();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
          >
            <span className="text-xl">🚪</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className={`hidden lg:flex ${sidebarCollapsed ? 'w-20' : 'w-64'} bg-zinc-800 border-r border-zinc-700 transition-all duration-300 flex-col relative`}>
        
        {/* Logo Section */}
        <div className={`p-6 border-b border-zinc-700 ${sidebarCollapsed ? 'text-center' : ''}`}>
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <div className="text-3xl mb-2">⚽</div>
                <h1 className="text-xl font-bold text-white">Football Club</h1>
                <p className="text-xs text-zinc-500 mt-1">Management System</p>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="text-3xl mx-auto">⚽</div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-zinc-500 hover:bg-zinc-700 p-1 rounded transition-all duration-200"
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>
        </div>

        {/* Desktop User Info */}
        <div className={`p-4 border-b border-zinc-700 ${sidebarCollapsed ? 'text-center' : ''} bg-zinc-800/50`}>
          <div className={`flex ${sidebarCollapsed ? 'flex-col' : 'items-center'} gap-3`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1">
                <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-zinc-500 text-xs mt-0.5">
                  {getRoleName(user?.role)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navigation Menu */}
        <nav className="flex-1 py-6 overflow-y-auto" style={{ marginBottom: '80px' }}>
          {filteredMenu.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-blue-500/10 border-r-2 border-blue-500 text-blue-400'
                  : 'text-zinc-500 hover:bg-zinc-700/30 hover:text-zinc-200'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <span className={`text-xl transition-transform duration-200 group-hover:scale-110 ${
                isActive(item.path) ? 'scale-110' : ''
              }`}>{item.icon}</span>
              {!sidebarCollapsed && (
                <span className={`text-sm font-medium transition-all duration-200 ${
                  isActive(item.path) ? 'translate-x-1' : ''
                }`}>{item.name}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Desktop Logout Button - Positioned 30px from bottom */}
        <div className={`absolute bottom-8 ${sidebarCollapsed ? 'left-0 right-0 px-2' : 'left-0 right-0 px-4'}`}>
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              sidebarCollapsed ? 'justify-center' : ''
            } bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300`}
          >
            <span className="text-xl transition-transform duration-200 group-hover:scale-110">🚪</span>
            {!sidebarCollapsed && (
              <span className="text-sm font-medium transition-all duration-200 group-hover:translate-x-1">Logout</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content - With padding for mobile header */}
      <div className="flex-1 overflow-auto lg:ml-0">
        <div className="pt-16 lg:pt-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;