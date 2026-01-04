const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const depts = await Department.find({});
    res.json(depts);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/', protect, authorize('Principal'), async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json(dept);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;