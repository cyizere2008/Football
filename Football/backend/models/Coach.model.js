const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coachName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Head Coach', 'Assistant Coach', 'Goalkeeper Coach', 'Fitness Coach']
  },
  phone: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    default: 0
  },
  qualifications: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Coach', coachSchema);