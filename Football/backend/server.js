const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Import Routes
const authRoutes = require('./routes/auth.routes');
const playerRoutes = require('./routes/player.routes');
const coachRoutes = require('./routes/coach.routes');
const matchRoutes = require('./routes/match.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const financeRoutes = require('./routes/finance.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/finance', financeRoutes);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/football_club';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    console.log('📀 Database: football_club');
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('💡 Make sure MongoDB is running');
  }); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Test: http://localhost:${PORT}/test`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
});