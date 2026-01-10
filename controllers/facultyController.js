const Achievement = require('../models/Achievement');
const User = require('../models/User'); // Import User model to find HOD
const { sendNewSubmissionNotification } = require('../utils/emailService');
const ApiResponse = require('../utils/ApiResponse');

exports.addAchievement = async (req, res) => {
  try {
    const { title, description, category, achievementDate } = req.body;
    const achievement = await Achievement.create({
      title, description, category, achievementDate,
      faculty: req.user._id,
      department: req.user.department // Auto-tagged with faculty's department
    });

    // Notify Department HOD
    const hod = await User.findOne({ role: 'HOD', department: req.user.department });
    if (hod && hod.email) {
      await sendNewSubmissionNotification(hod.email, req.user.name, title);
    }
    res.status(201).json(new ApiResponse(201, achievement, "Achievement submitted successfully"));
  } catch (error) { res.status(500).json(new ApiResponse(500, null, error.message)); }
};

exports.getMyAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ faculty: req.user._id }).sort({ achievementDate: -1 });
    res.status(200).json(new ApiResponse(200, achievements));
  } catch (error) { res.status(500).json(new ApiResponse(500, null, error.message)); }
};

// Requirement: "Edit achievements" [cite: 15]
exports.updateAchievement = async (req, res) => {
  try {
    const { title, description, category, achievementDate, subCategory,
      startDate, endDate, duration, fundedBy, grantAmount } = req.body;

    const updateData = {
      title,
      description,
      category,
      achievementDate,
      subCategory,
      startDate,
      endDate,
      duration,
      fundedBy,
      grantAmount,
      status: 'Pending', // Reset status on edit
      rejectionReason: null, // Clear rejection reason
      approvedBy: null,
      approvedAt: null
    };

    if (req.file) {
      updateData.proof = req.file.path;
    }

    const achievement = await Achievement.findOneAndUpdate(
      { _id: req.params.id, faculty: req.user._id },
      updateData,
      { new: true }
    );

    if (!achievement) return res.status(404).json(new ApiResponse(404, null, 'Not found or unauthorized'));
    res.status(200).json(new ApiResponse(200, achievement, "Achievement updated successfully"));
  } catch (error) { res.status(500).json(new ApiResponse(500, null, error.message)); }
};