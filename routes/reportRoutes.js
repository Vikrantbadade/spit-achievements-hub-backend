const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const { protect, authorize } = require('../middleware/authMiddleware');
const { downloadExcelReport } = require('../controllers/reportController');

// Global Middleware
router.use(protect);

// GET /api/v1/reports/export/excel
// Accessible by HOD and Principal
router.get('/export/excel', authorize('HOD', 'Principal'), downloadExcelReport);

module.exports = router;


router.get('/generate', protect, async (req, res) => {
  try {
    console.log("Generate Report Request:", req.query, "User Role:", req.user.role, "User ID:", req.user._id);
    const { startDate, endDate, departmentId, faculty } = req.query;
    let query = {};
    if (startDate && endDate) query.achievementDate = { $gte: new Date(startDate), $lte: new Date(endDate) };

    if (req.user.role === 'Faculty') {
      query.faculty = req.user._id;
    } else if (req.user.role === 'HOD') {
      query.department = req.user.department;
      if (faculty) query.faculty = faculty; // Allow filtering by faculty within department
    } else if (req.user.role === 'Principal') {
      if (departmentId) query.department = departmentId;
      if (faculty) query.faculty = faculty;
    } else if (req.user.role === 'Admin') {
      // Admin sees all, allows filtering
      if (departmentId) query.department = departmentId;
      if (faculty) query.faculty = faculty;
    }

    const data = await Achievement.find(query)
      .populate('faculty', 'name')
      .populate('department', 'name');
    res.json({ count: data.length, reportData: data });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;