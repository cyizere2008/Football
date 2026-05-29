import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Finance = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [showModal, setShowModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    transactionType: 'expense',
    category: 'Equipment',
    description: '',
    amount: '',
    paymentMethod: 'Cash'
  });
  const { user } = useAuth();

  const categories = {
    expense: ['Equipment', 'Travel', 'Stadium', 'Medical', 'Marketing', 'Other'],
    income: ['Sponsorship', 'Ticket Sales', 'Registration', 'Other'],
    salary: ['Player Salary', 'Coach Salary']
  };

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/finance');
      setTransactions(response.data.transactions);
    } catch (error) {
      toast.error('Failed to fetch transactions');
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get('/finance/summary');
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Failed to fetch summary');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance', formData);
      toast.success('Transaction recorded successfully');
      fetchTransactions();
      fetchSummary();
      setShowModal(false);
      setFormData({
        transactionType: 'expense',
        category: 'Equipment',
        description: '',
        amount: '',
        paymentMethod: 'Cash'
      });
    } catch (error) {
      toast.error('Failed to record transaction');
    }
  };

  const getTransactionTypeColor = (type) => {
    if (type === 'income') return 'text-green-400';
    return 'text-red-400';
  };

  // Prepare chart data
  const expenseData = transactions
    .filter(t => t.transactionType === 'expense' || t.transactionType === 'salary')
    .reduce((acc, t) => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short' });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.amount += t.amount;
      } else {
        acc.push({ month, amount: t.amount });
      }
      return acc;
    }, [])
    .slice(-6);

  const categoryData = transactions.reduce((acc, t) => {
    const existing = acc.find(item => item.category === t.category);
    if (existing) {
      existing.amount += t.amount;
    } else {
      acc.push({ category: t.category, amount: t.amount });
    }
    return acc;
  }, []);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-zinc-800 border-b border-zinc-700 px-4 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <h1 className="text-lg font-bold text-white">Finance</h1>
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
              <div className="text-3xl mb-2">💰</div>
              <h1 className="text-xl font-bold text-white">Finance</h1>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Financial Management</h1>
            <p className="text-zinc-400 text-sm sm:text-base mt-1">Track and manage club finances</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'accountant') && (
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg transition duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl"
            >
              <span className="text-lg sm:text-xl">+</span>
              Add Transaction
            </button>
          )}
        </div>
        
        {/* Summary Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Income Card */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 sm:p-6 text-white shadow-lg border border-green-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <p className="text-xs sm:text-sm opacity-90 flex items-center gap-2">
              <span className="text-base sm:text-lg">💰</span> Total Income
            </p>
            <p className="text-xl sm:text-3xl font-bold mt-2">${summary.totalIncome.toLocaleString()}</p>
            <div className="mt-2 h-1 bg-green-400/30 rounded-full">
              <div className="h-1 bg-green-400 rounded-full w-full"></div>
            </div>
          </div>
          
          {/* Expenses Card */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-4 sm:p-6 text-white shadow-lg border border-red-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <p className="text-xs sm:text-sm opacity-90 flex items-center gap-2">
              <span className="text-base sm:text-lg">📊</span> Total Expenses
            </p>
            <p className="text-xl sm:text-3xl font-bold mt-2">${summary.totalExpenses.toLocaleString()}</p>
            <div className="mt-2 h-1 bg-red-400/30 rounded-full">
              <div className="h-1 bg-red-400 rounded-full w-full"></div>
            </div>
          </div>
          
          {/* Balance Card */}
          <div className="sm:col-span-2 lg:col-span-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 sm:p-6 text-white shadow-lg border border-blue-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <p className="text-xs sm:text-sm opacity-90 flex items-center gap-2">
              <span className="text-base sm:text-lg">⚖️</span> Balance
            </p>
            <p className="text-xl sm:text-3xl font-bold mt-2">${summary.balance.toLocaleString()}</p>
            <div className="mt-2 h-1 bg-blue-400/30 rounded-full">
              <div className={`h-1 rounded-full ${summary.balance >= 0 ? 'bg-green-400' : 'bg-red-400'} w-full`}></div>
            </div>
          </div>
        </div>
        
        {/* Charts Section - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Monthly Expenses Chart */}
          <div className="bg-zinc-800 rounded-xl shadow-md p-4 sm:p-6 border border-zinc-700">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-lg sm:text-xl">📈</span> Monthly Expenses Trend
            </h3>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={expenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                  <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Expense Distribution Chart */}
          <div className="bg-zinc-800 rounded-xl shadow-md p-4 sm:p-6 border border-zinc-700">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-lg sm:text-xl">🥧</span> Expense Distribution
            </h3>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => percent > 0.05 ? `${category}: ${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Transactions Table - Responsive */}
        <div className="bg-zinc-800 rounded-xl shadow-md overflow-hidden border border-zinc-700">
          <div className="px-4 sm:px-6 py-4 border-b border-zinc-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="text-lg sm:text-xl">📋</span> Transaction History
            </h3>
            <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">{transactions.length} transactions</span>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900/50">
                <tr className="border-b border-zinc-700">
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Category</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Description</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-zinc-700/30 transition-all duration-200">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-300 text-sm">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-zinc-300 text-sm">{transaction.category}</td>
                      <td className="px-4 sm:px-6 py-4 text-zinc-300 text-sm">{transaction.description}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`capitalize ${getTransactionTypeColor(transaction.transactionType)} font-semibold text-sm`}>
                          {transaction.transactionType}
                        </span>
                      </td>
                      <td className={`px-4 sm:px-6 py-4 font-semibold ${getTransactionTypeColor(transaction.transactionType)} text-sm`}>
                        ${transaction.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-zinc-500 text-sm">
                      No transactions yet. Click "Add Transaction" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-zinc-700">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction._id} className="p-4 hover:bg-zinc-700/30 transition-all duration-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-zinc-400 text-xs">{new Date(transaction.date).toLocaleDateString()}</span>
                    <span className={`capitalize ${getTransactionTypeColor(transaction.transactionType)} font-semibold text-xs px-2 py-1 rounded-full ${
                      transaction.transactionType === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {transaction.transactionType}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 text-xs">Category:</span>
                      <span className="text-zinc-300 text-xs">{transaction.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 text-xs">Description:</span>
                      <span className="text-zinc-300 text-xs">{transaction.description}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 text-xs">Amount:</span>
                      <span className={`font-semibold text-sm ${getTransactionTypeColor(transaction.transactionType)}`}>
                        ${transaction.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-500 text-sm">
                No transactions yet. Click "Add Transaction" to get started.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Transaction Modal - Responsive */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md border border-zinc-700 mx-auto">
            <div className="px-4 sm:px-6 py-4 border-b border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Add Transaction</h2>
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
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">
                    Transaction Type
                  </label>
                  <select
                    value={formData.transactionType}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        transactionType: e.target.value,
                        category: categories[e.target.value]?.[0] || 'Other'
                      });
                    }}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                    required
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="salary">Salary</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                    required
                  >
                    {categories[formData.transactionType]?.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Enter description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition placeholder-zinc-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm font-bold mb-2">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                  >
                    <option value="Cash">💵 Cash</option>
                    <option value="Bank Transfer">🏦 Bank Transfer</option>
                    <option value="Check">📝 Check</option>
                    <option value="Credit Card">💳 Credit Card</option>
                  </select>
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
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;