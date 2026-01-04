const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const { protect } = require('../middleware/authMiddleware');

router.get('/generate', protect, async (req, res) => {
  try {
    const { startDate, endDate, departmentId } = req.query;
    let query = {};
    if (startDate && endDate) query.achievementDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    
    if (req.user.role === 'Faculty') query.faculty = req.user._id;
    else if (req.user.role === 'HOD') query.department = req.user.department;
    else if (req.user.role === 'Principal' && departmentId) query.department = departmentId;
    
    const data = await Achievement.find(query).populate('faculty', 'name').populate('department', 'name');
    res.json({ count: data.length, reportData: data });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;