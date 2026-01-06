const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Department = require('../models/Department');

// ================================
// HELPER: Department Stats (SAFE)
// ================================
const getDepartmentStats = async (departmentId) => {
  const faculty = await User.find({
    role: 'Faculty',
    department: departmentId
  }).select('_id');

  const facultyIds = faculty.map(u => u._id);

  const achievements = await Achievement.find({
    faculty: { $in: facultyIds }
  });

  return {
    facultyCount: faculty.length,
    publications: achievements.filter(a => a.category === 'Publication').length,
    patents: achievements.filter(a => a.category === 'Patent').length,
    awards: achievements.filter(a => a.category === 'Award').length,
    fdps: achievements.filter(a => a.category === 'FDP').length,
    totalAchievements: achievements.length
  };
};

// ================================
// PRINCIPAL OVERVIEW
// ================================
exports.getDashboardOverview = async (req, res) => {
  try {
    const [totalDepartments, totalFaculty, totalAchievements] =
      await Promise.all([
        Department.countDocuments(),
        User.countDocuments({ role: 'Faculty' }),
        Achievement.countDocuments()
      ]);

    const allAchievements = await Achievement.find();

    const publications = allAchievements.filter(a => a.category === 'Publication').length;
    const patents = allAchievements.filter(a => a.category === 'Patent').length;
    const awards = allAchievements.filter(a => a.category === 'Award').length;
    const fdps = allAchievements.filter(a => a.category === 'FDP').length;

    const departments = await Department.find();

    const departmentSummary = await Promise.all(
      departments.map(async (dept) => {
        const stats = await getDepartmentStats(dept._id);
        return {
          departmentId: dept._id,
          name: dept.name,
          ...stats
        };
      })
    );

    const recentAchievements = await Achievement.find()
      .sort({ achievementDate: -1 })
      .limit(5)
      .populate({
        path: 'faculty',
        select: 'name department',
        populate: {
          path: 'department',
          select: 'name'
        }
      });

    const recentHighlights = recentAchievements.map(a => ({
      achievementId: a._id,
      title: a.title,
      category: a.category,
      department: a.faculty?.department?.name || 'Unknown',
      faculty: a.faculty?.name || 'Unknown',
      achievementDate: a.achievementDate
    }));

    res.json({
      totalDepartments,
      totalFaculty,
      totalAchievements,
      publications,
      patents,
      awards,
      fdps,
      departmentSummary,
      recentHighlights
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ================================
// ALL DEPARTMENTS
// ================================
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find();

    const data = await Promise.all(
      departments.map(async (dept) => {
        const stats = await getDepartmentStats(dept._id);

        const hod = await User.findOne({
          role: 'HOD',
          department: dept._id
        }).select('name');

        return {
          departmentId: dept._id,
          name: dept.name,
          hod: hod ? hod.name : "Not Assigned",
          ...stats
        };
      })
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


exports.getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find()
      .populate({
        path: 'faculty',
        select: 'name email department',
        populate: {
          path: 'department',
          select: 'name'
        }
      })
      .sort({ achievementDate: -1 });

    const response = achievements.map(a => ({
      achievementId: a._id,
      _id: a._id,
      title: a.title,
      category: a.category,
      achievementDate: a.achievementDate,
      department: a.faculty?.department?.name || 'Unknown',
      faculty: {
        facultyId: a.faculty?._id,
        name: a.faculty?.name || 'Unknown',
        email: a.faculty?.email
      },
      status: a.status
    }));

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// exports.getAllAchievements = async (req, res) => {
//   try {
//     const achievements = await Achievement.find()
//       .populate("department", "name")
//       .populate("faculty", "name email")
//       .sort({ achievementDate: -1 });

//     res.status(200).json(achievements);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// ================================
// DEPARTMENT ACHIEVEMENTS
// ================================
exports.getDepartmentAchievementsById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const faculty = await User.find({
      role: 'Faculty',
      department: department._id
    }).select('_id');

    const facultyIds = faculty.map(u => u._id);

    const achievements = await Achievement.find({
      faculty: { $in: facultyIds }
    })
      .populate('faculty', 'name')
      .sort({ achievementDate: -1 });

    res.json(
      achievements.map(a => ({
        title: a.title,
        category: a.category,
        achievementDate: a.achievementDate,
        faculty: a.faculty?.name || 'Unknown',
        status: a.status
      }))
    );

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ================================
// QUICK STATS
// ================================
exports.getPrincipalStats = async (req, res) => {
  try {
    const [totalDepartments, totalFaculty, totalAchievements, pendingApprovals] =
      await Promise.all([
        Department.countDocuments(),
        User.countDocuments({ role: 'Faculty' }),
        Achievement.countDocuments(),
        Achievement.countDocuments({ status: 'Pending' })
      ]);

    res.json({
      totalDepartments,
      totalFaculty,
      totalAchievements,
      pendingApprovals
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
