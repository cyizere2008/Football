import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

const CoachDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPlayers: 0,
    todayAttendance: 0,
    upcomingMatches: 0,
    totalTrainingSessions: 0
  });
  const [recentAttendance, setRecentAttendance] = useState([]);

  useEffect(() => {
    fetchCoachData();
  }, []);

  const fetchCoachData = async () => {
    try {
      const [playersRes, attendanceRes, matchesRes] = await Promise.all([
        api.get('/players'),
        api.get('/attendance'),
        api.get('/matches')
      ]);
      
      const today = new Date().toDateString();
      const todayAttendance = attendanceRes.data.attendance.filter(
        a => new Date(a.trainingDate).toDateString() === today && a.status === 'present'
      ).length;
      
      const upcomingMatches = matchesRes.data.matches.filter(
        m => m.status === 'upcoming'
      ).length;
      
      setStats({
        totalPlayers: playersRes.data.players.length,
        todayAttendance: todayAttendance,
        upcomingMatches: upcomingMatches,
        totalTrainingSessions: 12
      });
      
      setRecentAttendance(attendanceRes.data.attendance.slice(0, 5));
    } catch (error) {
      console.error('Error fetching coach data:', error);
    }
  };

  const statCards = [
    { title: 'Total Players', value: stats.totalPlayers, icon: '👥', color: 'from-blue-600 to-blue-700' },
    { title: "Today's Attendance", value: stats.todayAttendance, icon: '✅', color: 'from-green-600 to-green-700' },
    { title: 'Upcoming Matches', value: stats.upcomingMatches, icon: '⚽', color: 'from-yellow-600 to-yellow-700' },
    { title: 'Training Sessions', value: stats.totalTrainingSessions, icon: '🏋️', color: 'from-purple-600 to-purple-700' }
  ];

  const quickActions = [
    { title: 'Record Attendance', path: '/attendance', icon: '📝', color: 'bg-green-600 hover:bg-green-700' },
    { title: 'Manage Players', path: '/players', icon: '👤', color: 'bg-blue-600 hover:bg-blue-700' },
    { title: 'Training Sessions', path: '/training-sessions', icon: '🏃', color: 'bg-orange-600 hover:bg-orange-700' },
    { title: 'Player Performance', path: '/player-performance', icon: '📊', color: 'bg-purple-600 hover:bg-purple-700' }
  ];

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'present': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'absent': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'late': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getPerformanceColor = (performance) => {
    switch(performance) {
      case 'Excellent': return 'text-green-400';
      case 'Good': return 'text-blue-400';
      default: return 'text-yellow-400';
    }
  };

  return (
    <div className="bg-zinc-900 min-h-screen">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Coach Dashboard</h1>
          <p className="text-zinc-400 mt-2">Welcome back, Coach {user?.name}!</p>
          <p className="text-sm text-blue-400 mt-1 flex items-center gap-2">
            <span className="text-lg">🏃</span>
            Manage your team's training and performance
          </p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className={`bg-gradient-to-r ${stat.color} rounded-xl shadow-lg p-6 border border-white/10 hover:shadow-xl transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm flex items-center gap-2">
                    <span className="text-lg">{stat.icon}</span> {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg text-white text-2xl backdrop-blur-sm">
                  {stat.icon}
                </div>
              </div>
              <div className="mt-3 h-1 bg-white/20 rounded-full">
                <div className="h-1 bg-white/50 rounded-full w-full"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">⚡</span> Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className={`${action.color} text-white rounded-xl p-4 hover:opacity-90 transition-all duration-300 flex items-center justify-between shadow-lg hover:shadow-xl hover:scale-105 transform`}
              >
                <span className="font-semibold">{action.title}</span>
                <span className="text-2xl transition-transform duration-200 group-hover:scale-110">{action.icon}</span>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Recent Attendance */}
        <div className="bg-zinc-800 rounded-xl shadow-md border border-zinc-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">📋</span> Recent Attendance Records
            </h2>
            <span className="text-xs text-zinc-500">{recentAttendance.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900/50">
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 px-4 text-zinc-400 text-sm font-medium">Player</th>
                  <th className="text-left py-3 px-4 text-zinc-400 text-sm font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-zinc-400 text-sm font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-zinc-400 text-sm font-medium">Performance</th>
                  <th className="text-left py-3 px-4 text-zinc-400 text-sm font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700">
                {recentAttendance.length > 0 ? (
                  recentAttendance.map((record) => (
                    <tr key={record._id} className="hover:bg-zinc-700/30 transition-all duration-200">
                      <td className="py-3 px-4 font-medium text-white">
                        {record.player?.playerName} 
                        <span className="text-zinc-500 text-xs ml-2">(#{record.player?.jerseyNumber})</span>
                      </td>
                      <td className="py-3 px-4 text-zinc-300">
                        {new Date(record.trainingDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${getPerformanceColor(record.performance)}`}>
                          {record.performance || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 max-w-xs truncate">
                        {record.notes || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-zinc-500">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-300 text-sm">🏆 Keep up the great work, Coach!</p>
              <p className="text-zinc-500 text-xs mt-1">Your dedication inspires the team</p>
            </div>
            <div className="text-3xl">🏃‍♂️</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;