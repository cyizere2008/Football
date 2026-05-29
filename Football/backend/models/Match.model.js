const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  opponent: {
    type: String,
    required: true
  },
  matchDate: {
    type: Date,
    required: true
  },
  stadium: {
    type: String,
    required: true
  },
  result: {
    type: String,
    default: 'Not Played'
  },
  ourScore: {
    type: Number,
    default: 0
  },
  opponentScore: {
    type: Number,
    default: 0
  },
  matchType: {
    type: String,
    enum: ['League', 'Cup', 'Friendly', 'International'],
    default: 'League'
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  lineup: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Match', matchSchema);