const Achievement = require('../models/Achievement');
const User = require('../models/User');

// HOD: View Faculty List (Dept Only) [cite: 22]
exports.getDeptFaculty = async (req, res) => {
  try {
    const faculty = await User.find({ department: req.user.department, role: 'Faculty' }).select('-password');
    res.json(faculty);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// HOD: View Dept Achievements (Dept Only) [cite: 22]
exports.getDeptAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ department: req.user.department })
      .populate('faculty', 'name')
      .sort({ achievementDate: -1 });
    res.json(achievements);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// Principal: View All Achievements [cite: 26]
exports.getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({})
      .populate('faculty', 'name')
      .populate('department', 'name code')
      .sort({ achievementDate: -1 });
    res.json(achievements);
  } catch (error) { res.status(500).json({ message: error.message }); }
};