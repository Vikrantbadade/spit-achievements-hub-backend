const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getDashboardOverview,
  getAllDepartments,
  getAllAchievements,
  getDepartmentAchievementsById,
  getPrincipalStats
} = require('../controllers/principalController');

// Global Middleware for Principal Routes
router.use(protect);
router.use(authorize('Principal'));

// 1. Dashboard & Overview
router.get('/overview', getDashboardOverview);

// 2. Departments
router.get('/departments', getAllDepartments);
router.get('/department/:departmentId/achievements', getDepartmentAchievementsById);

// 3. Achievements
router.get('/achievements', getAllAchievements);

// 4. Stats (Optional quick stats)
router.get('/stats', getPrincipalStats);

module.exports = router;