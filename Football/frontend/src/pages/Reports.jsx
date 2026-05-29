import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Reports = () => {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [reportType, setReportType] = useState('players');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [playersRes, matchesRes, attendanceRes, financeRes] = await Promise.all([
        api.get('/players'),
        api.get('/matches'),
        api.get('/attendance'),
        api.get('/finance')
      ]);
      setPlayers(playersRes.data.players);
      setMatches(matchesRes.data.matches);
      setAttendance(attendanceRes.data.attendance);
      setTransactions(financeRes.data.transactions);
    } catch (error) {
      toast.error('Failed to fetch report data');
    }
  };

  const downloadReport = () => {
    let data = '';
    let filename = '';
    
    switch(reportType) {
      case 'players':
        data = players.map(p => `${p.playerName},${p.age},${p.position},${p.jerseyNumber},${p.nationality},${p.status}`).join('\n');
        filename = 'players_report.csv';
        break;
      case 'matches':
        data = matches.map(m => `${m.opponent},${new Date(m.matchDate).toLocaleDateString()},${m.stadium},${m.result},${m.status}`).join('\n');
        filename = 'matches_report.csv';
        break;
      case 'attendance':
        data = attendance.map(a => `${a.player?.playerName},${new Date(a.trainingDate).toLocaleDateString()},${a.status},${a.performance}`).join('\n');
        filename = 'attendance_report.csv';
        break;
      case 'finance':
        data = transactions.map(t => `${t.category},${t.description},${t.transactionType},${t.amount},${new Date(t.date).toLocaleDateString()}`).join('\n');
        filename = 'finance_report.csv';
        break;
    }
    
    const blob = new Blob([`Report generated on ${new Date().toLocaleString()}\n\n${data}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report downloaded successfully');
  };

  // Performance chart data
  const performanceData = players.map(p => ({
    name: p.playerName,
    goals: p.goals || 0,
    assists: p.assists || 0,
    matches: p.matchesPlayed || 0
  })).slice(0, 10);

  // Match results data
  const matchResults = matches.filter(m => m.status === 'completed').map(m => ({
    opponent: m.opponent,
    result: m.result,
    date: new Date(m.matchDate).toLocaleDateString()
  }));

  const attendanceStats = {
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length,
    excused: attendance.filter(a => a.status === 'excused').length
  };

  const attendanceData = [
    { name: 'Present', value: attendanceStats.present, color: '#10B981', icon: '✅' },
    { name: 'Absent', value: attendanceStats.absent, color: '#EF4444', icon: '❌' },
    { name: 'Late', value: attendanceStats.late, color: '#F59E0B', icon: '⏰' },
    { name: 'Excused', value: attendanceStats.excused, color: '#6B7280', icon: '📝' }
  ];

  const reportOptions = [
    { value: 'players', label: 'Players Report', icon: '👥', color: 'from-blue-600 to-blue-700' },
    { value: 'matches', label: 'Matches Report', icon: '⚽', color: 'from-green-600 to-green-700' },
    { value: 'attendance', label: 'Attendance Report', icon: '✅', color: 'from-yellow-600 to-yellow-700' },
    { value: 'finance', label: 'Financial Report', icon: '💰', color: 'from-purple-600 to-purple-700' }
  ];

  const getResultColor = (result) => {
    if (result.includes('Won')) return 'text-green-400 bg-green-500/20 border border-green-500/30';
    if (result.includes('Lost')) return 'text-red-400 bg-red-500/20 border border-red-500/30';
    return 'text-yellow-400 bg-yellow-500/20 border border-yellow-500/30';
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-zinc-800 border-b border-zinc-700 px-4 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <h1 className="text-lg font-bold text-white">Reports</h1>
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
              <div className="text-3xl mb-2">📊</div>
              <h1 className="text-xl font-bold text-white">Reports</h1>
              <p className="text-xs text-zinc-500 mt-1">Analytics & Data</p>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Reports & Analytics</h1>
            <p className="text-zinc-400 text-sm sm:text-base mt-1">View insights and download detailed reports</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition appearance-none cursor-pointer"
              >
                {reportOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.icon} {option.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <span className="text-zinc-400">▼</span>
              </div>
            </div>
            {(user?.role === 'admin' || user?.role === 'accountant') && (
              <button
                onClick={downloadReport}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 rounded-lg transition duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl"
              >
                <span className="text-lg">📥</span>
                Download Report
              </button>
            )}
          </div>
        </div>
        
        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Player Performance Chart */}
          <div className="bg-zinc-800 rounded-xl shadow-md p-4 sm:p-6 border border-zinc-700 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📊</span>
              <h3 className="text-lg font-bold text-white">Player Performance (Top 10)</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                  <Bar dataKey="goals" fill="#3B82F6" name="Goals" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="assists" fill="#10B981" name="Assists" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Attendance Overview Chart */}
          <div className="bg-zinc-800 rounded-xl shadow-md p-4 sm:p-6 border border-zinc-700 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🥧</span>
              <h3 className="text-lg font-bold text-white">Attendance Overview</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {attendanceData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-zinc-400">{item.icon} {item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Recent Match Results */}
        <div className="bg-zinc-800 rounded-xl shadow-md p-4 sm:p-6 mb-8 border border-zinc-700">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⚽</span>
            <h3 className="text-lg font-bold text-white">Recent Match Results</h3>
            <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full ml-auto">{matchResults.length} matches</span>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900/50">
                <tr className="border-b border-zinc-700">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Opponent</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700">
                {matchResults.slice(-10).map((match, index) => (
                  <tr key={index} className="hover:bg-zinc-700/40 transition-all duration-200">
                    <td className="px-6 py-4 text-zinc-300 text-sm">{match.date}</td>
                    <td className="px-6 py-4 font-medium text-white text-sm">{match.opponent}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getResultColor(match.result)}`}>
                        {match.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {matchResults.slice(-10).map((match, index) => (
              <div key={index} className="bg-zinc-900 rounded-lg p-4 border border-zinc-700">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-white text-sm">{match.opponent}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getResultColor(match.result)}`}>
                    {match.result}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs">Date:</span>
                  <span className="text-zinc-300 text-xs">{match.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Summary Tables based on report type */}
        <div className="bg-zinc-800 rounded-xl shadow-md overflow-hidden border border-zinc-700">
          <div className="px-4 sm:px-6 py-4 border-b border-zinc-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {reportType === 'players' && '👥'}
                {reportType === 'matches' && '⚽'}
                {reportType === 'attendance' && '✅'}
                {reportType === 'finance' && '💰'}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {reportType === 'players' && 'Players List'}
                {reportType === 'matches' && 'Match Schedule'}
                {reportType === 'attendance' && 'Attendance Records'}
                {reportType === 'finance' && 'Financial Transactions'}
              </h3>
            </div>
            <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">
              {reportType === 'players' && players.length}
              {reportType === 'matches' && matches.length}
              {reportType === 'attendance' && attendance.length}
              {reportType === 'finance' && transactions.length} records
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {/* Players Table */}
            {reportType === 'players' && (
              <table className="w-full">
                <thead className="bg-zinc-900/50">
                  <tr className="border-b border-zinc-700">
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Name</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Age</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Position</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Jersey</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nationality</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                  {players.map(player => (
                    <tr key={player._id} className="hover:bg-zinc-700/40 transition-all duration-200">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {player.playerName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-white text-sm">{player.playerName}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-zinc-300 text-sm">{player.age}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          player.position === 'Goalkeeper' ? 'bg-purple-500/20 text-purple-400' :
                          player.position === 'Defender' ? 'bg-blue-500/20 text-blue-400' :
                          player.position === 'Midfielder' ? 'bg-green-500/20 text-green-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {player.position}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-zinc-300 text-sm">#{player.jerseyNumber}</td>
                      <td className="px-4 sm:px-6 py-4 text-zinc-300 text-sm">{player.nationality}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          player.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${player.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                          {player.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {/* Matches Table */}
            {reportType === 'matches' && (
              <table className="w-full">
                <thead className="bg-zinc-900/50">
                  <tr className="border-b border-zinc-700">
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Opponent</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Stadium</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Result</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                  {matches.map(match => (
                    <tr key={match._id} className="hover:bg-zinc-700/40 transition-all duration-200">
                      <td className="px-4 sm:px-6 py-4 font-medium text-white text-sm">{match.opponent}</td>
                      <td className="px-4 sm:px-6 py-4 text-zinc-300 text-sm">{new Date(match.matchDate).toLocaleDateString()}</td>
                      <td className="px-4 sm:px-6 py-4 text-zinc-300 text-sm">{match.stadium}</td>
                      <td className="px-4 sm:px-6 py-4 text-zinc-300 text-sm">{match.result}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          match.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          match.status === 'upcoming' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {match.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {/* Attendance Table */}
            {reportType === 'attendance' && (
              <table className="w-full">
                <thead className="bg-zinc-900/50">
                  <tr className="border-b border-zinc-700">
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Player</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                  {attendance.map(record => (
                    <tr key={record._id} className="hover:bg-zinc-700/40 transition-all duration-200">
                      <td className="px-4 sm:px-6 py-4 text-white text-sm">{record.player?.playerName} (#{record.player?.jerseyNumber})</td>
                      <td className="px-4 sm:px-6 py-4 text-zinc-300 text-sm">{new Date(record.trainingDate).toLocaleDateString()}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          record.status === 'present' ? 'bg-green-500/20 text-green-400' :
                          record.status === 'absent' ? 'bg-red-500/20 text-red-400' :
                          record.status === 'late' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          record.performance === 'Excellent' ? 'bg-green-500/20 text-green-400' :
                          record.performance === 'Good' ? 'bg-blue-500/20 text-blue-400' :
                          record.performance === 'Average' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {record.performance}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {/* Finance Table */}
            {reportType === 'finance' && (
              <table className="w-full">
                <thead className="bg-zinc-900/50">
                  <tr className="border-b border-zinc-700">
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Type</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                  {transactions.map(transaction => (
                    <tr key={transaction._id} className="hover:bg-zinc-700/40 transition-all duration-200">
                      <td className="px-4 sm:px-6 py-4 text-zinc-300 text-sm">{new Date(transaction.date).toLocaleDateString()}</td>
                      <td className="px-4 sm:px-6 py-4 text-zinc-300 text-sm">{transaction.category}</td>
                      <td className="px-4 sm:px-6 py-4 text-zinc-300 text-sm">{transaction.description}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          transaction.transactionType === 'income' ? 'bg-green-500/20 text-green-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {transaction.transactionType}
                        </span>
                      </td>
                      <td className={`px-4 sm:px-6 py-4 font-semibold text-sm ${
                        transaction.transactionType === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${transaction.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;