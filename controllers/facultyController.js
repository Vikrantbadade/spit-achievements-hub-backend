const Achievement = require('../models/Achievement');

exports.addAchievement = async (req, res) => {
  try {
    const { title, description, category, achievementDate } = req.body;
    const achievement = await Achievement.create({
      title, description, category, achievementDate,
      faculty: req.user._id,
      department: req.user.department // Auto-tagged with faculty's department
    });
    res.status(201).json(achievement);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getMyAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ faculty: req.user._id }).sort({ achievementDate: -1 });
    res.json(achievements);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// Requirement: "Edit achievements" [cite: 15]
exports.updateAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findOneAndUpdate(
      { _id: req.params.id, faculty: req.user._id }, // Ensure ownership
      req.body,
      { new: true }
    );
    if(!achievement) return res.status(404).json({ message: 'Not found or unauthorized' });
    res.json(achievement);
  } catch (error) { res.status(500).json({ message: error.message }); }
};