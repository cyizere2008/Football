const Finance = require('../models/Finance.model');

const getTransactions = async (req, res) => {
  try {
    const transactions = await Finance.find()
      .populate('recordedBy', 'name')
      .sort({ date: -1 });
    res.json({ success: true, transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: error.message });
  }
};

const createTransaction = async (req, res) => {
  try {
    req.body.recordedBy = req.user.id;
    const transaction = await Finance.create(req.body);
    res.status(201).json({ success: true, transaction });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: error.message });
  }
};

const getFinancialSummary = async (req, res) => {
  try {
    const transactions = await Finance.find();
    
    const totalIncome = transactions
      .filter(t => t.transactionType === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.transactionType === 'expense' || t.transactionType === 'salary')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Get recent transactions for chart
    const recentTransactions = transactions
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);
    
    res.json({
      success: true,
      summary: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses
      },
      recentTransactions
    });
  } catch (error) {
    console.error('Error getting financial summary:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Finance.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTransactions, createTransaction, getFinancialSummary, deleteTransaction };