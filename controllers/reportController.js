const Achievement = require('../models/Achievement');

// Generic Report Generator (JSON data for Frontend to convert to CSV/PDF)
exports.generateReport = async (req, res) => {
  try {
    const { startDate, endDate, departmentId } = req.query;
    
    let query = {};
    
    // Date Filter
    if (startDate && endDate) {
      query.achievementDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Role Logic
    if (req.user.role === 'Faculty') {
      query.faculty = req.user._id; // Only own data
    } else if (req.user.role === 'HOD') {
      query.department = req.user.department; // Only own dept data
    } else if (req.user.role === 'Principal') {
      if (departmentId) query.department = departmentId; // Optional filter
    }

    const data = await Achievement.find(query)
      .populate('faculty', 'name')
      .populate('department', 'name');
      
    res.json({ count: data.length, reportData: data });
  } catch (error) { res.status(500).json({ message: error.message }); }
};