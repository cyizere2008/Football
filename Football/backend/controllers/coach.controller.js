const Coach = require('../models/Coach.model');
const User = require('../models/User.model');

const getCoaches = async (req, res) => {
  try {
    const coaches = await Coach.find().populate('user', 'name email');
    res.json({ success: true, coaches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCoach = async (req, res) => {
  try {
    const { coachName, role, phone, experience, qualifications, email, password } = req.body;
    
    const user = await User.create({
      name: coachName,
      email,
      password,
      role: 'coach',
      phone
    });
    
    const coach = await Coach.create({
      user: user._id,
      coachName,
      role,
      phone,
      experience,
      qualifications
    });
    
    res.status(201).json({ success: true, coach });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCoach = async (req, res) => {
  try {
    const coach = await Coach.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }
    res.json({ success: true, coach });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCoach = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }
    await User.findByIdAndDelete(coach.user);
    await coach.deleteOne();
    res.json({ success: true, message: 'Coach deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCoaches, createCoach, updateCoach, deleteCoach };