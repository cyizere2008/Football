import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'player'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const { confirmPassword, ...userData } = formData;
    const success = await register(userData);
    
    setLoading(false);
    if (success) {
      navigate('/login');
    }
  };

  const roles = [
    { value: 'player', label: 'Player', icon: '⚽', color: 'bg-green-900 text-green-300 border-green-700' },
    { value: 'coach', label: 'Coach', icon: '🏃', color: 'bg-blue-900 text-blue-300 border-blue-700' },
    { value: 'accountant', label: 'Accountant', icon: '💰', color: 'bg-purple-900 text-purple-300 border-purple-700' },
    { value: 'admin', label: 'Administrator', icon: '👑', color: 'bg-red-900 text-red-300 border-red-700' }
  ];

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthText = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

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
  <h2 className="text-2xl font-bold text-white">Create Account</h2>
  <p className="text-zinc-400 mt-1 text-sm">Join the Football Club Management System</p>
</div>
          
          {error && (
            <div className="mx-6 mt-6 bg-red-900/50 border-l-4 border-red-500 text-red-300 px-4 py-3 rounded shadow-md animate-shake">
              <div className="flex items-center">
                <span className="text-lg mr-2">⚠️</span>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            {/* Full Name */}
            <div className="transform transition-all duration-300" style={{ transform: focusedField === 'name' ? 'translateX(5px)' : 'none' }}>
              <label className="block text-zinc-400 text-sm font-bold mb-2">
                <span className="text-lg mr-2">👤</span>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField('')}
                className="w-full px-4 py-3 bg-zinc-900 border-2 border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 placeholder-zinc-500"
                placeholder="Enter your full name"
                required
              />
            </div>
            
            {/* Email */}
            <div className="transform transition-all duration-300" style={{ transform: focusedField === 'email' ? 'translateX(5px)' : 'none' }}>
              <label className="block text-zinc-400 text-sm font-bold mb-2">
                <span className="text-lg mr-2">📧</span>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                className="w-full px-4 py-3 bg-zinc-900 border-2 border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 placeholder-zinc-500"
                placeholder="Enter your email"
                required
              />
            </div>
            
            {/* Phone */}
            <div className="transform transition-all duration-300" style={{ transform: focusedField === 'phone' ? 'translateX(5px)' : 'none' }}>
              <label className="block text-zinc-400 text-sm font-bold mb-2">
                <span className="text-lg mr-2">📞</span>
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField('')}
                className="w-full px-4 py-3 bg-zinc-900 border-2 border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 placeholder-zinc-500"
                placeholder="Enter your phone number"
              />
            </div>
            
            {/* Role Selection */}
            <div>
              <label className="block text-zinc-400 text-sm font-bold mb-2">
                <span className="text-lg mr-2">🎯</span>
                Select Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData({...formData, role: role.value})}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-300 ${
                      formData.role === role.value
                        ? `${role.color} border-transparent shadow-md transform scale-105`
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-blue-500 hover:text-blue-400'
                    }`}
                  >
                    <span className="text-lg">{role.icon}</span>
                    <span className="text-sm font-medium">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Password */}
            <div className="transform transition-all duration-300" style={{ transform: focusedField === 'password' ? 'translateX(5px)' : 'none' }}>
              <label className="block text-zinc-400 text-sm font-bold mb-2">
                <span className="text-lg mr-2">🔒</span>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  className="w-full px-4 py-3 bg-zinc-900 border-2 border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 pr-12 placeholder-zinc-500"
                  placeholder="Create a password (min 6 characters)"
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
              
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 h-2">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= level ? strengthColor[passwordStrength] : 'bg-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Password Strength: <span className="font-semibold">{strengthText[passwordStrength] || 'Very Weak'}</span>
                  </p>
                </div>
              )}
            </div>
            
            {/* Confirm Password */}
            <div className="transform transition-all duration-300" style={{ transform: focusedField === 'confirmPassword' ? 'translateX(5px)' : 'none' }}>
              <label className="block text-zinc-400 text-sm font-bold mb-2">
                <span className="text-lg mr-2">✅</span>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField('')}
                  className="w-full px-4 py-3 bg-zinc-900 border-2 border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 pr-12 placeholder-zinc-500"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-white text-xl"
                >
                  {showConfirmPassword ? '👁️' : '🔒'}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-400 mt-1 animate-pulse">✗ Passwords do not match</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
                <p className="text-xs text-green-400 mt-1">✓ Passwords match</p>
              )}
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
                  Creating Account...
                </div>
              ) : (
                'Create Account 🚀'
              )}
            </button>
          </form>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-700 text-center">
            <p className="text-zinc-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition">
                Login here →
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
          <p>⚡ Join thousands of football clubs worldwide ⚡</p>
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

export default Register;