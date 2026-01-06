const User = require('../models/User');
const Achievement = require('../models/Achievement');

// Helper: Get all faculty IDs in HOD's department
const getDepartmentFacultyIds = async (department) => {
  const faculty = await User.find({ role: 'Faculty', department }).select('_id');
  return faculty.map(user => user._id);
};

// ==============================
// GET HOD DASHBOARD STATS
// ==============================
exports.getDashboardStats = async (req, res) => {
  try {
    const department = req.user.department;
    const facultyIds = await getDepartmentFacultyIds(department);

    const [achievements, totalFaculty] = await Promise.all([
      Achievement.find({ faculty: { $in: facultyIds } }),
      User.countDocuments({ role: 'Faculty', department })
    ]);

    const stats = {
      publications: achievements.filter(a => a.category === 'Publication').length,
      patents: achievements.filter(a => a.category === 'Patent').length,
      awards: achievements.filter(a => a.category === 'Award').length,
      fdps: achievements.filter(a => a.category === 'FDP').length,
      pendingApprovals: achievements.filter(a => a.status === 'Pending').length,
      totalFaculty
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ==============================
// GET DEPARTMENT FACULTY LIST
// ==============================
exports.getFacultyList = async (req, res) => {
  try {
    const faculty = await User.find({
      role: 'Faculty',
      department: req.user.department
    }).select('name email designation department');

    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ==============================
// GET DEPARTMENT ACHIEVEMENTS
// ==============================
exports.getDepartmentAchievements = async (req, res) => {
  try {
    const facultyIds = await getDepartmentFacultyIds(req.user.department);

    const achievements = await Achievement.find({
      faculty: { $in: facultyIds }
    })
      .populate('faculty', 'name email department')
      .sort({ createdAt: -1 });

    res.status(200).json(achievements);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ==============================
// APPROVE ACHIEVEMENT
// ==============================
exports.approveAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id)
      .populate('faculty', 'department');

    if (!achievement) {
      return res.status(404).json({ message: "Achievement not found" });
    }

    if (
      achievement.faculty.department.toString() !==
      req.user.department.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized department access" });
    }

    achievement.status = 'Approved';
    achievement.approvedBy = req.user._id;
    achievement.approvedAt = Date.now();

    await achievement.save();

    res.status(200).json({ message: "Achievement Approved Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ==============================
// REJECT ACHIEVEMENT
// ==============================
exports.rejectAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id)
      .populate('faculty', 'department');

    if (!achievement) {
      return res.status(404).json({ message: "Achievement not found" });
    }

    if (
      achievement.faculty.department.toString() !==
      req.user.department.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized department access" });
    }

    achievement.status = 'Rejected';
    achievement.rejectionReason = req.body.reason || "Documents insufficient";

    await achievement.save();

    res.status(200).json({ message: "Achievement Rejected" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ==============================
// GET SINGLE FACULTY ACHIEVEMENTS
// ==============================
exports.getSingleFacultyAchievements = async (req, res) => {
  try {
    const targetFaculty = await User.findOne({
      _id: req.params.facultyId,
      department: req.user.department
    });

    if (!targetFaculty) {
      return res.status(404).json({ message: "Faculty not found in your department" });
    }

    const achievements = await Achievement.find({
      faculty: req.params.facultyId
    }).sort({ achievementDate: -1 });

    res.status(200).json(achievements);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
