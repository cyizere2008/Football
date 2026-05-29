const mongoose = require('mongoose');

const trainingSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  trainingDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
    required: true,
  },
  exercises: [{
    name: String,
    duration: Number,
    sets: Number,
  }],
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('TrainingSession', trainingSessionSchema);