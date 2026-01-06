const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getFacultyList,
  getDepartmentAchievements,
  approveAchievement,
  rejectAchievement,
  getSingleFacultyAchievements
} = require('../controllers/hodController');

// Global Middleware for HOD Routes
router.use(protect);
router.use(authorize('HOD'));

// 1. Dashboard Stats
router.get('/stats', getDashboardStats);

// 2. Faculty Management
router.get('/faculty-list', getFacultyList);
router.get('/faculty/:facultyId/achievements', getSingleFacultyAchievements);

// 3. Achievement Management
router.get('/achievements', getDepartmentAchievements);
router.put('/achievement/:id/approve', approveAchievement);
router.put('/achievement/:id/reject', rejectAchievement);

module.exports = router;