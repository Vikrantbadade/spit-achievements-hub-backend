const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('Faculty'));

router.post('/achievement', async (req, res) => {
  try {
    const achievement = await Achievement.create({
      ...req.body,
      faculty: req.user._id,
      department: req.user.department
    });
    res.status(201).json(achievement);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/achievements', async (req, res) => {
  try {
    const achievements = await Achievement.find({ faculty: req.user._id }).sort({ achievementDate: -1 });
    res.json(achievements);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/achievement/:id', async (req, res) => {
  try {
    const achievement = await Achievement.findOneAndUpdate({ _id: req.params.id, faculty: req.user._id }, req.body, { new: true });
    if(!achievement) return res.status(404).json({ message: 'Not found' });
    res.json(achievement);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;