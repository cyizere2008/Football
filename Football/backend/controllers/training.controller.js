const TrainingSession = require('../models/TrainingSession.model');

exports.getTrainingSessions = async (req, res) => {
  try {
    const sessions = await TrainingSession.find().populate('coachId');
    res.json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createTrainingSession = async (req, res) => {
  try {
    const session = await TrainingSession.create(req.body);
    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateTrainingSession = async (req, res) => {
  try {
    const session = await TrainingSession.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Training session not found',
      });
    }
    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteTrainingSession = async (req, res) => {
  try {
    const session = await TrainingSession.findByIdAndDelete(req.params.id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Training session not found',
      });
    }
    res.json({
      success: true,
      message: 'Training session deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};