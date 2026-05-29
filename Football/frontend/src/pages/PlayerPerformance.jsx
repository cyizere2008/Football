import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PlayerPerformance = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [performanceData, setPerformanceData] = useState([
    { month: 'Jan', goals: 2, assists: 1, rating: 7.5, minutes: 180 },
    { month: 'Feb', goals: 3, assists: 2, rating: 8.0, minutes: 210 },
    { month: 'Mar', goals: 1, assists: 3, rating: 7.8, minutes: 195 },
    { month: 'Apr', goals: 4, assists: 1, rating: 8.5, minutes: 225 },
    { month: 'May', goals: 2, assists: 2, rating: 7.9, minutes: 200 },
    { month: 'Jun', goals: 3, assists: 4, rating: 8.2, minutes: 215 }
  ]);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await api.get('/players');
      setPlayers(response.data.players);
      if (response.data.players.length > 0) {
        setSelectedPlayer(response.data.players[0]);
      }
    } catch (error) {
      console.error('Failed to fetch players');
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Player Performance Analysis</h1>
        <p className="text-gray-600 mt-2">Track and analyze player performance metrics</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Selection */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold mb-4">Select Player</h2>
          <select
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSelectedPlayer(players.find(p => p._id === e.target.value))}
            value={selectedPlayer?._id || ''}
          >
            <option value="">Select a player...</option>
            {players.map(player => (
              <option key={player._id} value={player._id}>
                {player.playerName} (#{player.jerseyNumber}) - {player.position}
              </option>
            ))}
          </select>
          
          {selectedPlayer && (
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Position:</span>
                <span className="font-semibold">{selectedPlayer.position}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Age:</span>
                <span className="font-semibold">{selectedPlayer.age}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Nationality:</span>
                <span className="font-semibold">{selectedPlayer.nationality}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Matches Played:</span>
                <span className="font-semibold">{selectedPlayer.matchesPlayed || 0}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Goals:</span>
                <span className="font-semibold text-green-600">{selectedPlayer.goals || 0}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Assists:</span>
                <span className="font-semibold text-blue-600">{selectedPlayer.assists || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ${selectedPlayer.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedPlayer.status}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Performance Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Stats Cards */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Performance Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {performanceData.reduce((sum, m) => sum + m.goals, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Goals</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {performanceData.reduce((sum, m) => sum + m.assists, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Assists</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {(performanceData.reduce((sum, m) => sum + m.rating, 0) / performanceData.length).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {performanceData.reduce((sum, m) => sum + m.minutes, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Minutes</p>
              </div>
            </div>
          </div>
          
          {/* Goals and Assists Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Goals & Assists Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="goals" fill="#3B82F6" name="Goals" />
                <Bar dataKey="assists" fill="#10B981" name="Assists" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Rating Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Performance Rating Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rating" stroke="#F59E0B" name="Rating" strokeWidth={3} />
                <Line type="monotone" dataKey="minutes" stroke="#8B5CF6" name="Minutes Played" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerPerformance;