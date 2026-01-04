const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Computer Engineering"
  code: { type: String, required: true, unique: true }  // e.g., "COMP"
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);