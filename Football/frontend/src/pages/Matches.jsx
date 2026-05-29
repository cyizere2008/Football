import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalMatches: 0,
    upcomingMatches: 0,
    completedMatches: 0,
    winRate: 0
  });
  const [formData, setFormData] = useState({
    opponent: '',
    matchDate: '',
    stadium: '',
    matchType: 'League',
    status: 'upcoming',
    ourScore: '',
    opponentScore: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await api.get('/matches');
      const matchesData = response.data.matches;
      setMatches(matchesData);
      
      // Calculate stats
      const total = matchesData.length;
      const upcoming = matchesData.filter(m => m.status === 'upcoming').length;
      const completed = matchesData.filter(m => m.status === 'completed').length;
      const wins = matchesData.filter(m => m.result && m.result.includes('Won')).length;
      const winRate = completed > 0 ? Math.round((wins / completed) * 100) : 0;
      
      setStats({
        totalMatches: total,
        upcomingMatches: upcoming,
        completedMatches: completed,
        winRate: winRate
      });
    } catch (error) {
      toast.error('Failed to fetch matches');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let matchData = { ...formData };
      
      // Calculate result if both scores are provided
      if (formData.ourScore && formData.opponentScore && formData.status === 'completed') {
        const ourScore = parseInt(formData.ourScore);
        const opponentScore = parseInt(formData.opponentScore);
        if (ourScore > opponentScore) {
          matchData.result = `${ourScore}-${opponentScore} Won`;
        } else if (ourScore < opponentScore) {
          matchData.result = `${ourScore}-${opponentScore} Lost`;
        } else {
          matchData.result = `${ourScore}-${opponentScore} Draw`;
        }
        matchData.ourScore = ourScore;
        matchData.opponentScore = opponentScore;
      }
      
      if (editingMatch) {
        await api.put(`/matches/${editingMatch._id}`, matchData);
        toast.success('Match updated successfully');
      } else {
        await api.post('/matches', matchData);
        toast.success('Match scheduled successfully');
      }
      fetchMatches();
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        await api.delete(`/matches/${id}`);
        toast.success('Match deleted successfully');
        fetchMatches();
      } catch (error) {
        toast.error('Failed to delete match');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      opponent: '',
      matchDate: '',
      stadium: '',
      matchType: 'League',
      status: 'upcoming',
      ourScore: '',
      opponentScore: ''
    });
    setEditingMatch(null);
  };

  const matchTypes = ['League', 'Cup', 'Friendly', 'International'];
  const statuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'upcoming': return '⏳';
      case 'ongoing': return '⚡';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      default: return '📅';
    }
  };

  const getMatchTypeIcon = (type) => {
    switch(type) {
      case 'League': return '🏆';
      case 'Cup': return '🥇';
      case 'Friendly': return '🤝';
      case 'International': return '🌍';
      default: return '⚽';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-zinc-800 border-b border-zinc-700 px-4 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚽</span>
          <h1 className="text-lg font-bold text-white">Matches</h1>
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
              <div className="text-3xl mb-2">⚽</div>
              <h1 className="text-xl font-bold text-white">Matches</h1>
              <p className="text-xs text-zinc-500 mt-1">Fixture Manager</p>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Matches Management</h1>
            <p className="text-zinc-400 text-sm sm:text-base mt-1">Schedule, track and manage all matches</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'coach') && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg transition duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl"
            >
              <span className="text-lg sm:text-xl">+</span>
              Schedule Match
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 sm:p-6 border border-blue-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm">Total Matches</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.totalMatches}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg text-white text-xl sm:text-2xl">📅</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-4 sm:p-6 border border-yellow-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-xs sm:text-sm">Upcoming</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.upcomingMatches}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg text-white text-xl sm:text-2xl">⏳</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 sm:p-6 border border-green-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs sm:text-sm">Completed</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.completedMatches}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg text-white text-xl sm:text-2xl">✅</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 sm:p-6 border border-purple-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs sm:text-sm">Win Rate</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.winRate}%</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg text-white text-xl sm:text-2xl">🏆</div>
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {matches.length > 0 ? (
            matches.map((match) => (
              <div key={match._id} className="bg-zinc-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border border-zinc-700 group">
                {/* Match Header */}
                <div className={`p-4 sm:p-5 ${
                  match.status === 'upcoming' ? 'bg-gradient-to-r from-yellow-600/20 to-transparent' :
                  match.status === 'completed' ? 'bg-gradient-to-r from-green-600/20 to-transparent' :
                  match.status === 'ongoing' ? 'bg-gradient-to-r from-blue-600/20 to-transparent' :
                  'bg-gradient-to-r from-gray-600/20 to-transparent'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getMatchTypeIcon(match.matchType)}</span>
                      <h3 className="text-lg sm:text-xl font-bold text-white">{match.opponent}</h3>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      match.status === 'upcoming' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      match.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      match.status === 'ongoing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      <span>{getStatusIcon(match.status)}</span>
                      {match.status}
                    </span>
                  </div>
                </div>
                
                {/* Match Body */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-3 text-zinc-300">
                    <span className="text-lg">📅</span>
                    <span className="text-sm">{new Date(match.matchDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300">
                    <span className="text-lg">🏟️</span>
                    <span className="text-sm">{match.stadium}</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300">
                    <span className="text-lg">🏆</span>
                    <span className="text-sm">{match.matchType}</span>
                  </div>
                  
                  {match.status === 'completed' && match.result && (
                    <div className="mt-3 pt-3 border-t border-zinc-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📊</span>
                          <span className="text-sm text-zinc-400">Result:</span>
                        </div>
                        <span className={`font-bold text-lg ${
                          match.result.includes('Won') ? 'text-green-400' :
                          match.result.includes('Lost') ? 'text-red-400' :
                          'text-yellow-400'
                        }`}>
                          {match.result}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {match.status === 'upcoming' && (
                    <div className="mt-3 pt-3 border-t border-zinc-700">
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-zinc-500">Days Left</p>
                          <p className="text-lg font-bold text-yellow-400">
                            {Math.ceil((new Date(match.matchDate) - new Date()) / (1000 * 60 * 60 * 24))}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-zinc-500">Time</p>
                          <p className="text-lg font-bold text-blue-400">
                            {new Date(match.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                {(user?.role === 'admin' || user?.role === 'coach') && (
                  <div className="px-4 sm:px-5 py-3 bg-zinc-900/50 border-t border-zinc-700 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setEditingMatch(match);
                        setFormData({
                          ...match,
                          ourScore: match.ourScore || '',
                          opponentScore: match.opponentScore || ''
                        });
                        setShowModal(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-200 text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(match._id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">⚽</div>
              <p className="text-zinc-500 text-sm">No matches scheduled yet.</p>
              {(user?.role === 'admin' || user?.role === 'coach') && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Schedule First Match
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Match Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md border border-zinc-700">
            <div className="px-4 sm:px-6 py-4 border-b border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white">{editingMatch ? '✏️ Edit Match' : '📅 Schedule Match'}</h2>
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
              <div className="space-y-4">
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Opponent Team *</label>
                  <input
                    type="text"
                    placeholder="Enter opponent team name"
                    value={formData.opponent}
                    onChange={(e) => setFormData({...formData, opponent: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Match Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.matchDate}
                    onChange={(e) => setFormData({...formData, matchDate: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Stadium *</label>
                  <input
                    type="text"
                    placeholder="Enter stadium name"
                    value={formData.stadium}
                    onChange={(e) => setFormData({...formData, stadium: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Match Type</label>
                    <select
                      value={formData.matchType}
                      onChange={(e) => setFormData({...formData, matchType: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                    >
                      {matchTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {formData.status === 'completed' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Our Score</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={formData.ourScore}
                        onChange={(e) => setFormData({...formData, ourScore: e.target.value})}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Opponent Score</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={formData.opponentScore}
                        onChange={(e) => setFormData({...formData, opponentScore: e.target.value})}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                      />
                    </div>
                  </div>
                )}
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
                  {editingMatch ? 'Update Match' : 'Schedule Match'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;