const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('Faculty'));
// DELETE /api/v1/faculty/achievement/:id
router.delete('/achievement/:id', async (req, res) => {
  try {
    // 1. Find the achievement by ID *AND* ensure it belongs to the logged-in faculty
    const achievement = await Achievement.findOneAndDelete({
      _id: req.params.id,
      faculty: req.user._id
    });

    // 2. If no achievement found (or it belongs to someone else)
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found or unauthorized' });
    }

    // 3. Success response
    res.json({ message: 'Achievement deleted successfully', id: req.params.id });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
const upload = require('../middleware/upload');

// ... (keep delete route as is)

router.post('/achievement', upload.single('proof'), async (req, res) => {
  try {
    const achievementData = {
      ...req.body,
      faculty: req.user._id,
      department: req.user.department
    };

    if (req.file) {
      achievementData.proof = req.file.path;
    }

    const achievement = await Achievement.create(achievementData);
    res.status(201).json(achievement);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/achievements', async (req, res) => {
  try {
    const achievements = await Achievement.find({ faculty: req.user._id }).sort({ achievementDate: -1 });
    res.json(achievements);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/achievement/:id', upload.single('proof'), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.proof = req.file.path;
    }

    const achievement = await Achievement.findOneAndUpdate({ _id: req.params.id, faculty: req.user._id }, updateData, { new: true });
    if (!achievement) return res.status(404).json({ message: 'Not found' });
    res.json(achievement);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;