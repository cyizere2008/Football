import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    activePlayers: 0,
    injuredPlayers: 0,
    avgAge: 0
  });
  const [formData, setFormData] = useState({
    playerName: '',
    age: '',
    position: '',
    jerseyNumber: '',
    nationality: '',
    email: '',
    password: '',
    phone: '',
    height: '',
    weight: '',
    goals: '',
    assists: '',
    matchesPlayed: '',
    status: 'active'
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await api.get('/players');
      const playersData = response.data.players;
      setPlayers(playersData);
      
      // Calculate stats
      const total = playersData.length;
      const active = playersData.filter(p => p.status === 'active').length;
      const injured = playersData.filter(p => p.status === 'injured').length;
      const avgAge = total > 0 ? Math.round(playersData.reduce((sum, p) => sum + p.age, 0) / total) : 0;
      
      setStats({
        totalPlayers: total,
        activePlayers: active,
        injuredPlayers: injured,
        avgAge: avgAge
      });
    } catch (error) {
      toast.error('Failed to fetch players');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlayer) {
        await api.put(`/players/${editingPlayer._id}`, formData);
        toast.success('Player updated successfully');
      } else {
        await api.post('/players', formData);
        toast.success('Player added successfully');
      }
      fetchPlayers();
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await api.delete(`/players/${id}`);
        toast.success('Player deleted successfully');
        fetchPlayers();
      } catch (error) {
        toast.error('Failed to delete player');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      playerName: '',
      age: '',
      position: '',
      jerseyNumber: '',
      nationality: '',
      email: '',
      password: '',
      phone: '',
      height: '',
      weight: '',
      goals: '',
      assists: '',
      matchesPlayed: '',
      status: 'active'
    });
    setEditingPlayer(null);
  };

  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
  const statusOptions = ['active', 'injured', 'suspended', 'inactive'];

  const getPositionColor = (position) => {
    switch(position) {
      case 'Goalkeeper': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'Defender': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'Midfielder': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'Forward': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'injured': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'suspended': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getStatusDot = (status) => {
    switch(status) {
      case 'active': return 'bg-green-400';
      case 'injured': return 'bg-red-400';
      case 'suspended': return 'bg-orange-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-zinc-800 border-b border-zinc-700 px-4 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👥</span>
          <h1 className="text-lg font-bold text-white">Players</h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-zinc-400 hover:text-white p-2 transition-colors"
        >
          <span className="text-2xl">{mobileMenuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-zinc-800 z-50 shadow-xl lg:hidden">
            <div className="p-6 border-b border-zinc-700">
              <div className="text-3xl mb-2">👥</div>
              <h1 className="text-xl font-bold text-white">Players</h1>
              <p className="text-xs text-zinc-500 mt-1">Roster Management</p>
            </div>
            <div className="p-4">
              <button onClick={() => setMobileMenuOpen(false)} className="w-full text-left px-4 py-2 text-zinc-400 hover:bg-zinc-700 rounded-lg transition">
                Close Menu
              </button>
            </div>
          </div>
        </>
      )}

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Players Management</h1>
            <p className="text-zinc-400 text-sm sm:text-base mt-1">Manage your team roster and player information</p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg transition duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl"
            >
              <span className="text-lg sm:text-xl">+</span>
              Add New Player
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 sm:p-6 border border-blue-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm">Total Players</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.totalPlayers}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg text-white text-xl sm:text-2xl">👥</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 sm:p-6 border border-green-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs sm:text-sm">Active Players</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.activePlayers}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg text-white text-xl sm:text-2xl">✅</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-4 sm:p-6 border border-red-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-xs sm:text-sm">Injured Players</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.injuredPlayers}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg text-white text-xl sm:text-2xl">⚠️</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 sm:p-6 border border-purple-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs sm:text-sm">Average Age</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.avgAge}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg text-white text-xl sm:text-2xl">🎂</div>
            </div>
          </div>
        </div>

        {/* Players Table */}
        <div className="bg-zinc-800 rounded-xl shadow-md overflow-hidden border border-zinc-700">
          <div className="px-4 sm:px-6 py-4 border-b border-zinc-700 flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="text-xl">📋</span> Player Roster
            </h2>
            <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">{players.length} players</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900/50">
                <tr className="border-b border-zinc-700">
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">#</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Player</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Age</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Position</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Jersey</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nationality</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                  {user?.role === 'admin' && <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700">
                {players.length > 0 ? (
                  players.map((player, index) => (
                    <tr key={player._id} className="hover:bg-zinc-700/40 transition-all duration-200 group">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-zinc-500 text-sm">{index + 1}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                            {player.playerName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{player.playerName}</p>
                            <p className="text-zinc-500 text-xs">{player.email?.split('@')[0] || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-zinc-300 text-sm">{player.age}</span>
                          <span className="text-zinc-600 text-xs">yrs</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPositionColor(player.position)}`}>
                          {player.position}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-semibold border border-yellow-500/30">
                          <span className="text-xs">👕</span>
                          #{player.jerseyNumber}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">🌍</span>
                          <span className="text-zinc-300 text-sm">{player.nationality}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(player.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(player.status)} mr-1`}></span>
                          {player.status}
                        </span>
                      </td>
                      {user?.role === 'admin' && (
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingPlayer(player);
                                setFormData(player);
                                setShowModal(true);
                              }}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                              title="Edit Player"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(player._id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                              title="Delete Player"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={user?.role === 'admin' ? 8 : 7} className="text-center py-12">
                      <div className="text-6xl mb-4">👥</div>
                      <p className="text-zinc-500 text-sm">No players added yet.</p>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => {
                            resetForm();
                            setShowModal(true);
                          }}
                          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                        >
                          Add Your First Player
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Player Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-zinc-700">
            <div className="sticky top-0 bg-zinc-800 border-b border-zinc-700 px-4 sm:px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {editingPlayer ? '✏️ Edit Player' : '➕ Add New Player'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-zinc-400 hover:text-white text-2xl transition"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Information */}
                <div className="md:col-span-2">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 border-b border-zinc-700 pb-2">📝 Personal Information</h3>
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="playerName"
                    value={formData.playerName}
                    onChange={(e) => setFormData({...formData, playerName: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                    placeholder="Enter player name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                    placeholder="Enter email address"
                    required={!editingPlayer}
                    disabled={editingPlayer}
                  />
                  {editingPlayer && <p className="text-xs text-zinc-500 mt-1">Email cannot be changed</p>}
                </div>
                
                {!editingPlayer && (
                  <div>
                    <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                      placeholder="Create password (min 6 characters)"
                      required={!editingPlayer}
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                    placeholder="Enter phone number"
                  />
                </div>
                
                {/* Football Information */}
                <div className="md:col-span-2">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 border-b border-zinc-700 pb-2 mt-2">⚽ Football Information</h3>
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Position *</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                    required
                  >
                    <option value="">Select Position</option>
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Jersey Number *</label>
                  <input
                    type="number"
                    name="jerseyNumber"
                    value={formData.jerseyNumber}
                    onChange={(e) => setFormData({...formData, jerseyNumber: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                    placeholder="Enter jersey number"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                    placeholder="16-45"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Nationality *</label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                    placeholder="Enter nationality"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                    placeholder="Height in cm"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                    placeholder="Weight in kg"
                  />
                </div>
                
                {/* Performance Statistics */}
                <div className="md:col-span-2">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 border-b border-zinc-700 pb-2 mt-2">📊 Performance Statistics</h3>
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Goals Scored</label>
                  <input
                    type="number"
                    name="goals"
                    value={formData.goals}
                    onChange={(e) => setFormData({...formData, goals: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                    placeholder="Total goals"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Assists</label>
                  <input
                    type="number"
                    name="assists"
                    value={formData.assists}
                    onChange={(e) => setFormData({...formData, assists: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                    placeholder="Total assists"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Matches Played</label>
                  <input
                    type="number"
                    name="matchesPlayed"
                    value={formData.matchesPlayed}
                    onChange={(e) => setFormData({...formData, matchesPlayed: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                    placeholder="Number of matches"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-zinc-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 sm:px-6 py-2 border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-700 transition order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition shadow-lg order-1 sm:order-2"
                >
                  {editingPlayer ? 'Update Player' : 'Add Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Players;