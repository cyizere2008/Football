import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TrainingSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([
    { id: 1, title: 'Morning Practice', date: '2024-01-15', time: '08:00', duration: '2 hours', location: 'Main Field', attendees: 18, status: 'upcoming' },
    { id: 2, title: 'Tactical Training', date: '2024-01-16', time: '14:00', duration: '1.5 hours', location: 'Training Ground', attendees: 22, status: 'upcoming' },
    { id: 3, title: 'Fitness Session', date: '2024-01-17', time: '10:00', duration: '1 hour', location: 'Gym', attendees: 20, status: 'upcoming' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: '',
    location: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSession = {
      id: sessions.length + 1,
      ...formData,
      attendees: 0,
      status: 'upcoming'
    };
    setSessions([...sessions, newSession]);
    toast.success('Training session scheduled successfully!');
    setShowModal(false);
    setFormData({ title: '', date: '', time: '', duration: '', location: '', description: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to cancel this training session?')) {
      setSessions(sessions.filter(session => session.id !== id));
      toast.success('Training session cancelled');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Training Sessions</h1>
          <p className="text-gray-600 mt-2">Manage and schedule team training sessions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Schedule Session
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
              <h3 className="text-lg font-bold">{session.title}</h3>
            </div>
            <div className="p-4">
              <div className="space-y-2 text-gray-600">
                <p>📅 Date: {new Date(session.date).toLocaleDateString()}</p>
                <p>⏰ Time: {session.time}</p>
                <p>⏱️ Duration: {session.duration}</p>
                <p>📍 Location: {session.location}</p>
                <p>👥 Expected: {session.attendees}/25 players</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm">
                  Mark Attendance
                </button>
                <button 
                  onClick={() => handleDelete(session.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal for scheduling */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Schedule Training Session</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Session Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Duration (e.g., 2 hours)"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingSessions;