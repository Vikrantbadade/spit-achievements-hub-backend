const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getDashboardStats,
    getSystemLogs,
    getAllAchievements,
    approveAchievement,
    rejectAchievement
} = require('../controllers/superAdminController');

// All routes are protected and require 'Admin' role
router.use(protect);
router.use(authorize('Admin'));

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/stats', getDashboardStats);
router.get('/logs', getSystemLogs);
router.get('/achievements', getAllAchievements);
router.put('/achievements/:id/approve', approveAchievement);
router.put('/achievements/:id/reject', rejectAchievement);

module.exports = router;
