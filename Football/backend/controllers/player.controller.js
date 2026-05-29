const Player = require('../models/Player.model');
const User = require('../models/User.model');

const getPlayers = async (req, res) => {
  try {
    const players = await Player.find().populate('user', 'name email phone');
    res.json({ success: true, players });
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ message: error.message });
  }
};

const createPlayer = async (req, res) => {
  try {
    const { 
      playerName, 
      age, 
      position, 
      jerseyNumber, 
      nationality, 
      email, 
      password,
      phone,
      height,
      weight,
      goals,
      assists,
      matchesPlayed,
      status
    } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists. Please use a different email address.' 
      });
    }
    
    // Check if jersey number exists
    const existingPlayer = await Player.findOne({ jerseyNumber });
    if (existingPlayer) {
      return res.status(400).json({ 
        success: false,
        message: `Jersey number ${jerseyNumber} is already taken. Please choose another number.` 
      });
    }
    
    // Create user account
    const user = await User.create({
      name: playerName,
      email,
      password,
      role: 'player',
      phone: phone || ''
    });
    
    // Create player with all fields
    const player = await Player.create({
      user: user._id,
      playerName,
      age: parseInt(age),
      position,
      jerseyNumber: parseInt(jerseyNumber),
      nationality,
      height: height ? parseInt(height) : 0,
      weight: weight ? parseInt(weight) : 0,
      goals: goals ? parseInt(goals) : 0,
      assists: assists ? parseInt(assists) : 0,
      matchesPlayed: matchesPlayed ? parseInt(matchesPlayed) : 0,
      status: status || 'active'
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Player created successfully!',
      player 
    });
  } catch (error) {
    console.error('Error creating player:', error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Duplicate entry. Email or jersey number already exists.' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error while creating player' 
    });
  }
};

const updatePlayer = async (req, res) => {
  try {
    const { 
      playerName, 
      age, 
      position, 
      jerseyNumber, 
      nationality,
      phone,
      height,
      weight,
      goals,
      assists,
      matchesPlayed,
      status
    } = req.body;
    
    // Check if jersey number exists for another player
    if (jerseyNumber) {
      const existingPlayer = await Player.findOne({ 
        jerseyNumber: parseInt(jerseyNumber),
        _id: { $ne: req.params.id }
      });
      if (existingPlayer) {
        return res.status(400).json({ 
          success: false,
          message: `Jersey number ${jerseyNumber} is already taken by another player.` 
        });
      }
    }
    
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      {
        playerName,
        age: parseInt(age),
        position,
        jerseyNumber: parseInt(jerseyNumber),
        nationality,
        phone,
        height: height ? parseInt(height) : 0,
        weight: weight ? parseInt(weight) : 0,
        goals: goals ? parseInt(goals) : 0,
        assists: assists ? parseInt(assists) : 0,
        matchesPlayed: matchesPlayed ? parseInt(matchesPlayed) : 0,
        status
      },
      { new: true, runValidators: true }
    );
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Update user phone if provided
    if (phone) {
      await User.findByIdAndUpdate(player.user, { phone });
    }
    
    res.json({ success: true, player });
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ message: error.message });
  }
};

const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    await User.findByIdAndDelete(player.user);
    await player.deleteOne();
    res.json({ success: true, message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPlayers, createPlayer, updatePlayer, deletePlayer };