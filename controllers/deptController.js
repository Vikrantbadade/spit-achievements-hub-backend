const Department = require('../models/Department');

exports.addDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;
    const dept = await Department.create({ name, code });
    res.status(201).json(dept);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// GET /api/v1/departments - List all
exports.getDepartments = async (req, res) => {
  try {
    const depts = await Department.find({});
    res.json(depts);
  } catch (error) { res.status(500).json({ message: error.message }); }
};