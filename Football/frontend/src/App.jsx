import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import Matches from './pages/Matches';
import Attendance from './pages/Attendance';
import Finance from './pages/Finance';
import Reports from './pages/Reports';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import CoachDashboard from './pages/CoachDashboard';
import TrainingSessions from './pages/TrainingSessions';
import PlayerPerformance from './pages/PlayerPerformance';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          
          {/* Admin Routes - Full Access */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="players" element={<Players />} />
          <Route path="matches" element={<Matches />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="finance" element={<Finance />} />
          <Route path="reports" element={<Reports />} />
          
          {/* Coach Specific Routes */}
          <Route path="coach-dashboard" element={<CoachDashboard />} />
          <Route path="training-sessions" element={<TrainingSessions />} />
          <Route path="player-performance" element={<PlayerPerformance />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;