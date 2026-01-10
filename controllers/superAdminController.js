// TITLE: Super Admin Controller
// Manages Admin capabilities including User Management, Dashboard Stats, and System Logs.
// UPDATED: Now returns password hashes to frontend for verification.
const User = require('../models/User');
const Department = require('../models/Department');
const Achievement = require('../models/Achievement');
const AuditLog = require('../models/AuditLog');
const { sendApprovalNotification, sendRejectionNotification } = require('../utils/emailService');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get all users (with optional role/dept filter)
// @route   GET /api/v1/admin/users
// @access  Admin
exports.getAllUsers = async (req, res) => {
    try {
        const { role, department } = req.query;
        const query = {};
        if (role) query.role = role;
        if (department) query.department = department;

        const users = await User.find(query)
            .populate('department', 'name code');

        res.status(200).json(new ApiResponse(200, users));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
};

// @desc    Create a new user (Super Admin Override)
// @route   POST /api/v1/admin/users
// @access  Admin
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json(new ApiResponse(400, null, 'User already exists'));
        }

        const user = await User.create({
            name,
            email,
            password, // Assumes User model has pre-save hash
            role,
            department: department || null
        });

        // Log action
        await AuditLog.create({
            actor: req.user._id,
            action: 'CREATE_USER',
            targetUser: user._id,
            details: { name, email, role, department },
            ipAddress: req.ip
        });

        const data = { id: user._id, name: user.name, email: user.email, role: user.role };
        res.status(201).json(new ApiResponse(201, data, 'User created successfully'));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
};

// @desc    Update user details
// @route   PUT /api/v1/admin/users/:id
// @access  Admin
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json(new ApiResponse(404, null, 'User not found'));

        const { name, email, role, department, password } = req.body;

        const oldState = { name: user.name, email: user.email, role: user.role, department: user.department };

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        user.department = department || user.department;

        if (password) {
            user.password = password;
        }

        const updatedUser = await user.save();

        await AuditLog.create({
            actor: req.user._id,
            action: 'UPDATE_USER',
            targetUser: user._id,
            details: { old: oldState, new: { name, email, role, department } },
            ipAddress: req.ip
        });

        const data = { id: updatedUser._id, name: updatedUser.name, role: updatedUser.role };
        res.status(200).json(new ApiResponse(200, data, 'User updated successfully'));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
};

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json(new ApiResponse(404, null, 'User not found'));

        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json(new ApiResponse(400, null, 'Cannot delete yourself'));
        }

        await User.deleteOne({ _id: req.params.id });

        await AuditLog.create({
            actor: req.user._id,
            action: 'DELETE_USER',
            targetUser: user._id,
            details: { deletedEmail: user.email },
            ipAddress: req.ip
        });

        res.status(200).json(new ApiResponse(200, null, 'User removed'));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
};

// @desc    Get Dashboard Stats
// @route   GET /api/v1/admin/stats
// @access  Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const facultyCount = await User.countDocuments({ role: 'Faculty' });
        const hodCount = await User.countDocuments({ role: 'HOD' });
        const principalCount = await User.countDocuments({ role: 'Principal' });
        const adminCount = await User.countDocuments({ role: 'Admin' });

        const totalDepts = await Department.countDocuments();

        const recentLogs = await AuditLog.find()
            .sort({ timestamp: -1 })
            .limit(5)
            .populate('actor', 'name email');

        const data = {
            counts: {
                total: totalUsers,
                faculty: facultyCount,
                hod: hodCount,
                principal: principalCount,
                admin: adminCount,
                departments: totalDepts
            },
            recentLogs
        };
        res.status(200).json(new ApiResponse(200, data));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
};

// @desc    Get System Logs
// @route   GET /api/v1/admin/logs
// @access  Admin
exports.getSystemLogs = async (req, res) => {
    try {
        const pageSize = 20;
        const page = Number(req.query.pageNumber) || 1;

        const count = await AuditLog.countDocuments({});
        const logs = await AuditLog.find({})
            .populate('actor', 'name email role')
            .sort({ timestamp: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.status(200).json(new ApiResponse(200, { logs, page, pages: Math.ceil(count / pageSize) }));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
};

// @desc    Get All Achievements (for bulk reports)
// @route   GET /api/v1/admin/achievements
// @access  Admin
exports.getAllAchievements = async (req, res) => {
    try {
        const { department } = req.query;
        const query = {};

        if (department) {
            query.department = department;
        }

        const achievements = await Achievement.find(query)
            .populate('faculty', 'name email department')
            .populate('department', 'name code')
            .sort({ achievementDate: -1 });

        res.status(200).json(new ApiResponse(200, achievements));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
};

// @desc    Approve Achievement (Admin Override)
// @route   PUT /api/v1/admin/achievements/:id/approve
// @access  Admin
exports.approveAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id).populate('faculty', 'name email');

        if (!achievement) {
            return res.status(404).json(new ApiResponse(404, null, "Achievement not found"));
        }

        achievement.status = 'Approved';
        achievement.approvedBy = req.user._id;
        achievement.approvedAt = Date.now();
        achievement.rejectionReason = null; // Clear previous rejection

        await achievement.save();

        // Send Email Notification
        if (achievement.faculty && achievement.faculty.email) {
            await sendApprovalNotification(achievement.faculty.email, achievement.faculty.name, achievement.title);
        }

        // Log action
        await AuditLog.create({
            actor: req.user._id,
            action: 'APPROVE_ACHIEVEMENT',
            targetUser: achievement.faculty,
            details: { achievementId: achievement._id, title: achievement.title },
            ipAddress: req.ip
        });

        res.status(200).json(new ApiResponse(200, null, "Achievement Approved Successfully"));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
};

// @desc    Reject Achievement (Admin Override)
// @route   PUT /api/v1/admin/achievements/:id/reject
// @access  Admin
exports.rejectAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id).populate('faculty', 'name email');

        if (!achievement) {
            return res.status(404).json(new ApiResponse(404, null, "Achievement not found"));
        }

        achievement.status = 'Rejected';
        achievement.rejectionReason = req.body.reason || "Admin Rejection";
        achievement.approvedBy = req.user._id;
        achievement.approvedAt = Date.now();

        await achievement.save();

        // Send Email Notification
        if (achievement.faculty && achievement.faculty.email) {
            await sendRejectionNotification(achievement.faculty.email, achievement.faculty.name, achievement.title, achievement.rejectionReason);
        }

        // Log action
        await AuditLog.create({
            actor: req.user._id,
            action: 'REJECT_ACHIEVEMENT',
            targetUser: achievement.faculty,
            details: { achievementId: achievement._id, title: achievement.title, reason: achievement.rejectionReason },
            ipAddress: req.ip
        });

        res.status(200).json(new ApiResponse(200, null, "Achievement Rejected"));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
};

// @desc    Get System Health (Uptime, Memory)
// @route   GET /api/v1/admin/health
// @access  Admin
exports.getSystemHealth = async (req, res) => {
    try {
        const health = {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            timestamp: Date.now(),
            nodeVersion: process.version,
            pid: process.pid
        };
        res.status(200).json(new ApiResponse(200, health));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
};
