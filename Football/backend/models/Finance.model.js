const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
  transactionType: {
    type: String,
    enum: ['expense', 'income', 'salary'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Player Salary', 'Coach Salary', 'Equipment', 'Travel', 'Stadium', 'Medical', 'Marketing', 'Registration', 'Sponsorship', 'Ticket Sales', 'Other']
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Check', 'Credit Card'],
    default: 'Cash'
  },
  receipt: {
    type: String,
    default: ''
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Finance', financeSchema);