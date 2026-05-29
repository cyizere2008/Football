import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalMatches: 0,
    upcomingMatches: 0,
    totalIncome: 0,
    totalExpenses: 0
  });
  const [recentMatches, setRecentMatches] = useState([]);
  const [recentPlayers, setRecentPlayers] = useState([]);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showEditPlayerModal, setShowEditPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [playersRes, matchesRes, financeRes] = await Promise.all([
        api.get('/players'),
        api.get('/matches'),
        api.get('/finance/summary')
      ]);
      
      const matches = matchesRes.data.matches;
      const upcoming = matches.filter(m => m.status === 'upcoming').length;
      const players = playersRes.data.players;
      
      setStats({
        totalPlayers: players.length,
        totalMatches: matches.length,
        upcomingMatches: upcoming,
        totalIncome: financeRes.data.summary?.totalIncome || 0,
        totalExpenses: financeRes.data.summary?.totalExpenses || 0
      });
      
      setRecentMatches(matches.slice(0, 5));
      setRecentPlayers(players.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!formData.playerName || !formData.email || !formData.password || !formData.position || !formData.jerseyNumber || !formData.age || !formData.nationality) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      if (formData.age && (formData.age < 16 || formData.age > 45)) {
        toast.error('Age must be between 16 and 45');
        setLoading(false);
        return;
      }
      
      const playerData = {
        playerName: formData.playerName,
        age: parseInt(formData.age),
        position: formData.position,
        jerseyNumber: parseInt(formData.jerseyNumber),
        nationality: formData.nationality,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || '',
        height: formData.height ? parseInt(formData.height) : 0,
        weight: formData.weight ? parseInt(formData.weight) : 0,
        goals: formData.goals ? parseInt(formData.goals) : 0,
        assists: formData.assists ? parseInt(formData.assists) : 0,
        matchesPlayed: formData.matchesPlayed ? parseInt(formData.matchesPlayed) : 0,
        status: formData.status
      };
      
      await api.post('/players', playerData);
      toast.success('Player added successfully!');
      
      resetForm();
      setShowAddPlayerModal(false);
      await fetchDashboardData();
      
    } catch (error) {
      console.error('Error adding player:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add player';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlayer = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const playerData = {
        playerName: formData.playerName,
        age: parseInt(formData.age),
        position: formData.position,
        jerseyNumber: parseInt(formData.jerseyNumber),
        nationality: formData.nationality,
        phone: formData.phone || '',
        height: formData.height ? parseInt(formData.height) : 0,
        weight: formData.weight ? parseInt(formData.weight) : 0,
        goals: formData.goals ? parseInt(formData.goals) : 0,
        assists: formData.assists ? parseInt(formData.assists) : 0,
        matchesPlayed: formData.matchesPlayed ? parseInt(formData.matchesPlayed) : 0,
        status: formData.status
      };
      
      await api.put(`/players/${editingPlayer._id}`, playerData);
      toast.success('Player updated successfully!');
      
      resetForm();
      setShowEditPlayerModal(false);
      await fetchDashboardData();
      
    } catch (error) {
      console.error('Error updating player:', error);
      toast.error(error.response?.data?.message || 'Failed to update player');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlayer = async (playerId, playerName) => {
    if (window.confirm(`Are you sure you want to delete ${playerName}?`)) {
      try {
        await api.delete(`/players/${playerId}`);
        toast.success('Player deleted successfully!');
        await fetchDashboardData();
      } catch (error) {
        console.error('Error deleting player:', error);
        toast.error('Failed to delete player');
      }
    }
  };

  const openEditModal = (player) => {
    setEditingPlayer(player);
    setFormData({
      playerName: player.playerName,
      age: player.age,
      position: player.position,
      jerseyNumber: player.jerseyNumber,
      nationality: player.nationality,
      email: player.user?.email || '',
      password: '',
      phone: player.phone || '',
      height: player.height || '',
      weight: player.weight || '',
      goals: player.goals || '',
      assists: player.assists || '',
      matchesPlayed: player.matchesPlayed || '',
      status: player.status || 'active'
    });
    setShowEditPlayerModal(true);
  };

  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
  const statusOptions = ['active', 'injured', 'suspended', 'inactive'];

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Mobile Header - Only visible on mobile */}
      <div className="lg:hidden sticky top-0 z-50 bg-zinc-800 border-b border-zinc-700 px-4 py-3 flex justify-between items-center shadow-lg">
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
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-zinc-800 z-50 shadow-xl lg:hidden transform transition-transform duration-300">
            <div className="p-6 border-b border-zinc-700">
              <div className="text-3xl mb-2">⚽</div>
              <h1 className="text-xl font-bold text-white">Football Club</h1>
              <p className="text-xs text-zinc-500 mt-1">Management System</p>
            </div>
            <div className="p-4 border-b border-zinc-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{user?.name}</p>
                  <p className="text-zinc-500 text-xs capitalize">
                    {user?.role === 'admin' ? 'Administrator' : 
                     user?.role === 'coach' ? 'Coach' :
                     user?.role === 'accountant' ? 'Accountant' : 'Player'}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-left px-4 py-2 text-zinc-400 hover:bg-zinc-700 rounded-lg transition"
              >
                Close Menu
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-zinc-400 text-sm sm:text-base mt-1">Welcome back, {user?.name}!</p>
            </div>
            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  resetForm();
                  setShowAddPlayerModal(true);
                }}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg transition duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl"
              >
                <span className="text-lg sm:text-xl">+</span>
                Add New Player
              </button>
            )}
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-zinc-800 rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition border border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-xs sm:text-sm">Total Players</p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">{stats.totalPlayers}</p>
              </div>
              <div className="bg-blue-500 p-2 sm:p-3 rounded-lg text-white text-xl sm:text-2xl">
                👥
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-800 rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition border border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-xs sm:text-sm">Total Matches</p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">{stats.totalMatches}</p>
              </div>
              <div className="bg-green-500 p-2 sm:p-3 rounded-lg text-white text-xl sm:text-2xl">
                📅
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-800 rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition border border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-xs sm:text-sm">Upcoming Matches</p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">{stats.upcomingMatches}</p>
              </div>
              <div className="bg-yellow-500 p-2 sm:p-3 rounded-lg text-white text-xl sm:text-2xl">
                🏆
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-800 rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition border border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-xs sm:text-sm">Balance</p>
                <p className="text-sm sm:text-2xl font-bold text-white mt-1 break-words">${(stats.totalIncome - stats.totalExpenses).toLocaleString()}</p>
              </div>
              <div className="bg-purple-500 p-2 sm:p-3 rounded-lg text-white text-xl sm:text-2xl">
                💰
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Players Section */}
        <div className="bg-zinc-800 rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8 border border-zinc-700">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">📋</span> Recent Players
            </h2>
            <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">{recentPlayers.length} players</span>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700 bg-zinc-900/50">
                  <th className="text-left py-3 px-4 text-zinc-400 text-xs font-medium">#</th>
                  <th className="text-left py-3 px-4 text-zinc-400 text-xs font-medium">Player Name</th>
                  <th className="text-left py-3 px-4 text-zinc-400 text-xs font-medium">Jersey #</th>
                  <th className="text-left py-3 px-4 text-zinc-400 text-xs font-medium">Position</th>
                  <th className="text-left py-3 px-4 text-zinc-400 text-xs font-medium">Age</th>
                  <th className="text-left py-3 px-4 text-zinc-400 text-xs font-medium">Nationality</th>
                  <th className="text-left py-3 px-4 text-zinc-400 text-xs font-medium">Goals</th>
                  <th className="text-left py-3 px-4 text-zinc-400 text-xs font-medium">Assists</th>
                  <th className="text-left py-3 px-4 text-zinc-400 text-xs font-medium">Status</th>
                  {user?.role === 'admin' && <th className="text-left py-3 px-4 text-zinc-400 text-xs font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {recentPlayers.length > 0 ? (
                  recentPlayers.map((player, index) => (
                    <tr key={player._id} className="border-b border-zinc-700 hover:bg-zinc-700/30 transition-all duration-200">
                      <td className="py-3 px-4 text-zinc-400 text-sm">{index + 1}</td>
                      <td className="py-3 px-4 font-medium text-white text-sm">{player.playerName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/30">
                          #{player.jerseyNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-300 text-sm">{player.position}</td>
                      <td className="py-3 px-4 text-zinc-300 text-sm">{player.age}</td>
                      <td className="py-3 px-4 text-zinc-300 text-sm">{player.nationality}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-green-400 text-sm">{player.goals || 0}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-blue-400 text-sm">{player.assists || 0}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          player.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          player.status === 'injured' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          player.status === 'suspended' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {player.status}
                        </span>
                      </td>
                      {user?.role === 'admin' && (
                        <td className="py-3 px-4">
                          <button
                            onClick={() => openEditModal(player)}
                            className="text-blue-400 hover:text-blue-300 mr-3 transition text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePlayer(player._id, player.playerName)}
                            className="text-red-400 hover:text-red-300 transition text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={user?.role === 'admin' ? 10 : 9} className="text-center py-8 text-zinc-500 text-sm">
                      No players added yet. Click "Add New Player" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {recentPlayers.length > 0 ? (
              recentPlayers.map((player, index) => (
                <div key={player._id} className="bg-zinc-900 rounded-lg p-4 border border-zinc-700 hover:border-zinc-600 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 text-xs">#{index + 1}</span>
                      <span className="font-semibold text-white text-sm">{player.playerName}</span>
                    </div>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/30">
                      #{player.jerseyNumber}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Position:</span>
                      <span className="text-zinc-300">{player.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Age:</span>
                      <span className="text-zinc-300">{player.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Nationality:</span>
                      <span className="text-zinc-300">{player.nationality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Goals:</span>
                      <span className="text-green-400 font-semibold">{player.goals || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Assists:</span>
                      <span className="text-blue-400 font-semibold">{player.assists || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Status:</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        player.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        player.status === 'injured' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        player.status === 'suspended' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {player.status}
                      </span>
                    </div>
                  </div>
                  {user?.role === 'admin' && (
                    <div className="flex justify-end gap-3 pt-3 border-t border-zinc-700">
                      <button
                        onClick={() => openEditModal(player)}
                        className="text-blue-400 hover:text-blue-300 text-sm transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(player._id, player.playerName)}
                        className="text-red-400 hover:text-red-300 text-sm transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-500 text-sm">
                No players added yet. Click "Add New Player" to get started.
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Matches */}
        <div className="bg-zinc-800 rounded-xl shadow-md p-4 sm:p-6 border border-zinc-700">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">⚽</span> Recent & Upcoming Matches
            </h2>
            <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">{recentMatches.length} matches</span>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700 bg-zinc-900/50">
                  <th className="text-left py-3 px-4 text-zinc-400 text-xs font-medium">Opponent</th>
                  <th className="text-left py-3 px-4 text-zinc-400 text-xs font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-zinc-400 text-xs font-medium">Stadium</th>
                  <th className="text-left py-3 px-4 text-zinc-400 text-xs font-medium">Result</th>
                  <th className="text-left py-3 px-4 text-zinc-400 text-xs font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentMatches.length > 0 ? (
                  recentMatches.map((match) => (
                    <tr key={match._id} className="border-b border-zinc-700 hover:bg-zinc-700/30 transition-all duration-200">
                      <td className="py-3 px-4 font-medium text-white text-sm">{match.opponent}</td>
                      <td className="py-3 px-4 text-zinc-300 text-sm">{new Date(match.matchDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-zinc-300 text-sm">{match.stadium}</td>
                      <td className="py-3 px-4 text-zinc-300 text-sm">{match.result}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          match.status === 'upcoming' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          match.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {match.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-zinc-500 text-sm">
                      No matches scheduled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View for Matches */}
          <div className="lg:hidden space-y-3">
            {recentMatches.length > 0 ? (
              recentMatches.map((match) => (
                <div key={match._id} className="bg-zinc-900 rounded-lg p-4 border border-zinc-700 hover:border-zinc-600 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-semibold text-white text-sm">{match.opponent}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      match.status === 'upcoming' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      match.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {match.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Date:</span>
                      <span className="text-zinc-300">{new Date(match.matchDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Stadium:</span>
                      <span className="text-zinc-300">{match.stadium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Result:</span>
                      <span className="text-zinc-300">{match.result}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-500 text-sm">
                No matches scheduled yet.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Player Modal */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-zinc-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-zinc-700">
            <div className="sticky top-0 bg-zinc-800 border-b border-zinc-700 px-4 sm:px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Add New Player</h2>
              <button
                onClick={() => {
                  setShowAddPlayerModal(false);
                  resetForm();
                }}
                className="text-zinc-400 hover:text-white text-2xl transition"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddPlayer} className="p-4 sm:p-6">
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                    placeholder="Create password (min 6 characters)"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
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
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                    placeholder="Number of matches"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
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
                    setShowAddPlayerModal(false);
                    resetForm();
                  }}
                  className="px-4 sm:px-6 py-2 border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-700 transition order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 sm:px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 order-1 sm:order-2 shadow-lg"
                >
                  {loading ? 'Adding Player...' : 'Add Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Player Modal */}
      {showEditPlayerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-zinc-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-zinc-700">
            <div className="sticky top-0 bg-zinc-800 border-b border-zinc-700 px-4 sm:px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Edit Player</h2>
              <button
                onClick={() => {
                  setShowEditPlayerModal(false);
                  resetForm();
                }}
                className="text-zinc-400 hover:text-white text-2xl transition"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleEditPlayer} className="p-4 sm:p-6">
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
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-zinc-500 rounded-lg cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-zinc-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-zinc-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditPlayerModal(false);
                    resetForm();
                  }}
                  className="px-4 sm:px-6 py-2 border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-700 transition order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 sm:px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 order-1 sm:order-2 shadow-lg"
                >
                  {loading ? 'Updating...' : 'Update Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;