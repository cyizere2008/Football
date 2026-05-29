const Match = require('../models/Match.model');

const getMatches = async (req, res) => {
  try {
    const matches = await Match.find().sort({ matchDate: 1 });
    res.json({ success: true, matches });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: error.message });
  }
};

const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.json({ success: true, match });
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ message: error.message });
  }
};

const createMatch = async (req, res) => {
  try {
    const match = await Match.create(req.body);
    res.status(201).json({ success: true, match });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.json({ success: true, match });
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.json({ success: true, message: 'Match deleted' });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMatches, createMatch, updateMatch, deleteMatch, getMatchById };