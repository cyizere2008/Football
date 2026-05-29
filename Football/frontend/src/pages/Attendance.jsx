import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [players, setPlayers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    attendanceRate: 0
  });
  const [formData, setFormData] = useState({
    player: '',
    trainingDate: new Date().toISOString().split('T')[0],
    status: 'present',
    performance: 'Average',
    notes: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchAttendance();
    fetchPlayers();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/attendance');
      const attendanceData = response.data.attendance;
      setAttendance(attendanceData);
      
      // Calculate today's stats
      const today = new Date().toISOString().split('T')[0];
      const todayRecords = attendanceData.filter(a => 
        new Date(a.trainingDate).toISOString().split('T')[0] === today
      );
      
      const presentToday = todayRecords.filter(a => a.status === 'present').length;
      const absentToday = todayRecords.filter(a => a.status === 'absent').length;
      const lateToday = todayRecords.filter(a => a.status === 'late').length;
      const totalToday = todayRecords.length;
      const attendanceRate = totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : 0;
      
      setStats({
        presentToday,
        absentToday,
        lateToday,
        attendanceRate
      });
    } catch (error) {
      toast.error('Failed to fetch attendance');
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await api.get('/players');
      setPlayers(response.data.players);
    } catch (error) {
      console.error('Failed to fetch players');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance', formData);
      toast.success('Attendance recorded successfully');
      fetchAttendance();
      setShowModal(false);
      setFormData({
        player: '',
        trainingDate: new Date().toISOString().split('T')[0],
        status: 'present',
        performance: 'Average',
        notes: ''
      });
    } catch (error) {
      toast.error('Failed to record attendance');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      present: 'bg-green-500/20 text-green-400 border border-green-500/30',
      absent: 'bg-red-500/20 text-red-400 border border-red-500/30',
      late: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      excused: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    };
    const icons = {
      present: '✅',
      absent: '❌',
      late: '⏰',
      excused: '📝'
    };
    return {
      className: styles[status] || styles.present,
      icon: icons[status] || '📅'
    };
  };

  const getPerformanceBadge = (performance) => {
    const styles = {
      Excellent: 'bg-green-500/20 text-green-400 border border-green-500/30',
      Good: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      Average: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      Poor: 'bg-red-500/20 text-red-400 border border-red-500/30'
    };
    const icons = {
      Excellent: '⭐',
      Good: '👍',
      Average: '👌',
      Poor: '👎'
    };
    return {
      className: styles[performance] || styles.Average,
      icon: icons[performance] || '📊'
    };
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-zinc-800 border-b border-zinc-700 px-4 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <h1 className="text-lg font-bold text-white">Attendance</h1>
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
              <div className="text-3xl mb-2">✅</div>
              <h1 className="text-xl font-bold text-white">Attendance</h1>
              <p className="text-xs text-zinc-500 mt-1">Track Training</p>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Attendance Tracking</h1>
            <p className="text-zinc-400 text-sm sm:text-base mt-1">Track player attendance and performance</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'coach') && (
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg transition duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl"
            >
              <span className="text-lg sm:text-xl">+</span>
              Record Attendance
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 sm:p-6 border border-green-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs sm:text-sm">Present Today</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.presentToday}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg text-white text-xl sm:text-2xl">✅</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-4 sm:p-6 border border-red-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-xs sm:text-sm">Absent Today</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.absentToday}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg text-white text-xl sm:text-2xl">❌</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-4 sm:p-6 border border-yellow-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-xs sm:text-sm">Late Today</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.lateToday}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg text-white text-xl sm:text-2xl">⏰</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 sm:p-6 border border-purple-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs sm:text-sm">Attendance Rate</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.attendanceRate}%</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg text-white text-xl sm:text-2xl">📊</div>
            </div>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="bg-zinc-800 rounded-xl shadow-md overflow-hidden border border-zinc-700">
          <div className="px-4 sm:px-6 py-4 border-b border-zinc-700 flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="text-xl">📋</span> Attendance Records
            </h2>
            <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">{attendance.length} records</span>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900/50">
                <tr className="border-b border-zinc-700">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700">
                {attendance.length > 0 ? (
                  attendance.map((record) => {
                    const statusBadge = getStatusBadge(record.status);
                    const performanceBadge = getPerformanceBadge(record.performance);
                    return (
                      <tr key={record._id} className="hover:bg-zinc-700/40 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                              {record.player?.playerName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white text-sm">{record.player?.playerName}</p>
                              <p className="text-zinc-500 text-xs">#{record.player?.jerseyNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="text-lg">📅</span>
                            <span className="text-zinc-300 text-sm">{new Date(record.trainingDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusBadge.className}`}>
                            <span>{statusBadge.icon}</span>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${performanceBadge.className}`}>
                            <span>{performanceBadge.icon}</span>
                            {record.performance}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-400 max-w-xs truncate">
                          {record.notes || '-'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12">
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-zinc-500 text-sm">No attendance records found.</p>
                      {(user?.role === 'admin' || user?.role === 'coach') && (
                        <button
                          onClick={() => setShowModal(true)}
                          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                        >
                          Record First Attendance
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-zinc-700">
            {attendance.length > 0 ? (
              attendance.map((record) => {
                const statusBadge = getStatusBadge(record.status);
                const performanceBadge = getPerformanceBadge(record.performance);
                return (
                  <div key={record._id} className="p-4 hover:bg-zinc-700/40 transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                        {record.player?.playerName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{record.player?.playerName}</p>
                        <p className="text-zinc-500 text-xs">#{record.player?.jerseyNumber}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Date:</span>
                        <span className="text-zinc-300">{new Date(record.trainingDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Status:</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusBadge.className}`}>
                          <span>{statusBadge.icon}</span>
                          {record.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Performance:</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${performanceBadge.className}`}>
                          <span>{performanceBadge.icon}</span>
                          {record.performance}
                        </span>
                      </div>
                      {record.notes && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Notes:</span>
                          <span className="text-zinc-400 text-xs">{record.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-zinc-500 text-sm">No attendance records found.</p>
                {(user?.role === 'admin' || user?.role === 'coach') && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    Record First Attendance
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Attendance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md border border-zinc-700">
            <div className="px-4 sm:px-6 py-4 border-b border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">📝</span> Record Attendance
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white text-2xl transition"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Select Player *</label>
                  <select
                    value={formData.player}
                    onChange={(e) => setFormData({...formData, player: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                    required
                  >
                    <option value="">Choose a player...</option>
                    {players.map(player => (
                      <option key={player._id} value={player._id}>
                        {player.playerName} (#{player.jerseyNumber})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Training Date *</label>
                  <input
                    type="date"
                    value={formData.trainingDate}
                    onChange={(e) => setFormData({...formData, trainingDate: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['present', 'absent', 'late', 'excused'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFormData({...formData, status})}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          formData.status === status
                            ? status === 'present' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                              status === 'absent' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              status === 'late' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Performance Rating</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Excellent', 'Good', 'Average', 'Poor'].map((performance) => (
                      <button
                        key={performance}
                        type="button"
                        onClick={() => setFormData({...formData, performance})}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          formData.performance === performance
                            ? performance === 'Excellent' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                              performance === 'Good' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              performance === 'Average' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                        }`}
                      >
                        {performance}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">Additional Notes</label>
                  <textarea
                    placeholder="Add any additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-zinc-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 sm:px-6 py-2 border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-700 transition order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition shadow-lg order-1 sm:order-2"
                >
                  Record Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;