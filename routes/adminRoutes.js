const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const { protect, authorize } = require('../middleware/authMiddleware');

// HOD Routes (Faculty List route removed)
router.get('/hod/achievements', protect, authorize('HOD'), async (req, res) => {
  try {
    const achievements = await Achievement.find({ department: req.user.department }).populate('faculty', 'name').sort({ achievementDate: -1 });
    res.json(achievements);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Principal Routes
router.get('/principal/achievements', protect, authorize('Principal'), async (req, res) => {
  try {
    const achievements = await Achievement.find({}).populate('faculty', 'name').populate('department', 'name code').sort({ achievementDate: -1 });
    res.json(achievements);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;