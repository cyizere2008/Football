const Player = require('../models/Player.model');
const Match = require('../models/Match.model');
const Attendance = require('../models/Attendance.model');
const Finance = require('../models/Finance.model');

exports.generateClubReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Players statistics
    const totalPlayers = await Player.countDocuments();
    const playersByPosition = await Player.aggregate([
      { $group: { _id: '$position', count: { $sum: 1 } } },
    ]);
    
    // Match statistics
    const matches = await Match.find({
      matchDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });
    
    const totalMatches = matches.length;
    const completedMatches = matches.filter(m => m.status === 'completed').length;
    const wins = matches.filter(m => 
      m.result === 'win' || (m.homeScore > m.awayScore && m.venue === 'home') ||
      (m.awayScore > m.homeScore && m.venue === 'away')
    ).length;
    
    // Attendance statistics
    const attendanceRecords = await Attendance.find({
      trainingDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });
    
    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
    const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;
    
    // Financial summary
    const finances = await Finance.aggregate([
      {
        $match: {
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: '$transactionType',
          total: { $sum: '$amount' },
        },
      },
    ]);
    
    const totalIncome = finances.find(f => f._id === 'income')?.total || 0;
    const totalExpense = finances.find(f => f._id === 'expense')?.total || 0;
    
    res.json({
      success: true,
      report: {
        period: { startDate, endDate },
        players: {
          total: totalPlayers,
          byPosition: playersByPosition,
        },
        matches: {
          total: totalMatches,
          completed: completedMatches,
          wins,
          winRate: completedMatches > 0 ? (wins / completedMatches) * 100 : 0,
        },
        attendance: {
          totalSessions: Math.ceil(totalAttendance / totalPlayers) || 0,
          totalRecords: totalAttendance,
          presentCount,
          attendanceRate: attendanceRate.toFixed(2),
        },
        finances: {
          totalIncome,
          totalExpense,
          netBalance: totalIncome - totalExpense,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.generatePlayerReport = async (req, res) => {
  try {
    const playerId = req.params.playerId;
    const player = await Player.findById(playerId);
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found',
      });
    }
    
    const attendance = await Attendance.find({ playerId });
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const attendanceRate = attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0;
    
    const playerMatches = await Match.find({
      'lineup': playerId,
    });
    
    res.json({
      success: true,
      report: {
        playerInfo: player,
        performance: player.performance,
        attendance: {
          total: attendance.length,
          present: presentCount,
          rate: attendanceRate.toFixed(2),
        },
        matchesPlayed: playerMatches.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.generateFinancialReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const transactions = await Finance.find({
      date: { $gte: startDate, $lte: endDate },
    }).populate('category');
    
    const incomeByCategory = transactions
      .filter(t => t.transactionType === 'income')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
    
    const expenseByCategory = transactions
      .filter(t => t.transactionType === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
    
    const totalIncome = Object.values(incomeByCategory).reduce((a, b) => a + b, 0);
    const totalExpense = Object.values(expenseByCategory).reduce((a, b) => a + b, 0);
    
    res.json({
      success: true,
      report: {
        period: { year, month, startDate, endDate },
        summary: {
          totalIncome,
          totalExpense,
          netProfit: totalIncome - totalExpense,
        },
        incomeByCategory,
        expenseByCategory,
        transactions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};