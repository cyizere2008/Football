import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Handle role-based redirect after login
  useEffect(() => {
    if (user) {
      const roleRedirects = {
        admin: '/dashboard',
        coach: '/coach-dashboard',
        accountant: '/finance',
        player: '/matches'
      };
      
      const redirectPath = roleRedirects[user.role] || '/dashboard';
      navigate(redirectPath);
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
    // Redirect is handled by useEffect
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400 rounded-full opacity-5 animate-pulse delay-500"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-yellow-500 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-pink-500 rounded-full opacity-20 animate-bounce delay-700"></div>
        
        <div className="bg-zinc-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 border border-zinc-700">
          {/* Header */}
          <div className="bg-zinc-800 border-b border-zinc-700 px-8 py-6 text-center">
            <div className="text-6xl mb-3 animate-bounce">⚽</div>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-zinc-400 mt-1 text-sm">Login to your account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            {/* Email Field */}
            <div className="transform transition-all duration-300" style={{ transform: focusedField === 'email' ? 'translateX(5px)' : 'none' }}>
              <label className="block text-zinc-400 text-sm font-bold mb-2">
                <span className="text-lg mr-2">📧</span>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                className="w-full px-4 py-3 bg-zinc-900 border-2 border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 placeholder-zinc-500"
                placeholder="Enter your email"
                required
              />
            </div>
            
            {/* Password Field */}
            <div className="transform transition-all duration-300" style={{ transform: focusedField === 'password' ? 'translateX(5px)' : 'none' }}>
              <label className="block text-zinc-400 text-sm font-bold mb-2">
                <span className="text-lg mr-2">🔒</span>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  className="w-full px-4 py-3 bg-zinc-900 border-2 border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 pr-12 placeholder-zinc-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-white text-xl"
                >
                  {showPassword ? '👁️' : '🔒'}
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-all duration-300 disabled:opacity-50 font-semibold text-lg transform hover:scale-105 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Logging in...
                </div>
              ) : (
                'Login →'
              )}
            </button>
          </form>
          
          {/* Demo Accounts Section */}
          <div className="px-6 pb-2">
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700">
              <p className="text-zinc-400 text-sm text-center mb-3 flex items-center justify-center gap-2">
                <span className="text-lg">🎯</span>
                Demo Accounts
                <span className="text-lg">🎯</span>
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">👑 Admin:</span>
                  <span className="text-zinc-400">admin@football.com</span>
                  <span className="text-zinc-500">/ password</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">🏃 Coach:</span>
                  <span className="text-zinc-400">coach@football.com</span>
                  <span className="text-zinc-500">/ password</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">💰 Accountant:</span>
                  <span className="text-zinc-400">accountant@football.com</span>
                  <span className="text-zinc-500">/ password</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">⚽ Player:</span>
                  <span className="text-zinc-400">player@football.com</span>
                  <span className="text-zinc-500">/ password</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-700 text-center">
            <p className="text-zinc-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition">
                Register here →
              </Link>
            </p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="h-px bg-zinc-700 flex-1"></div>
              <span className="text-xs text-zinc-500">or</span>
              <div className="h-px bg-zinc-700 flex-1"></div>
            </div>
            <div className="flex justify-center gap-6 mt-3">
              <div className="text-center">
                <div className="text-2xl">⚽</div>
                <p className="text-xs text-zinc-500">Join Team</p>
              </div>
              <div className="text-center">
                <div className="text-2xl">🏆</div>
                <p className="text-xs text-zinc-500">Win Together</p>
              </div>
              <div className="text-center">
                <div className="text-2xl">📊</div>
                <p className="text-xs text-zinc-500">Track Stats</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6 text-zinc-500 text-sm">
          <p>⚡ Secure login with role-based access ⚡</p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce {
          animation: bounce 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
        }
        .animate-pulse {
          animation: pulse 3s ease-in-out infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-700 {
          animation-delay: 0.7s;
        }
      `}</style>
    </div>
  );
};

export default Login;