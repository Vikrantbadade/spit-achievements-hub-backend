const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  // e.g., "Publication", "FDP", "Patent", "Award"
  category: {
    type: String,
    enum: ['Publication', 'FDP', 'Patent', 'Award', 'Certification', 'Seminar', 'STTP', 'Project', 'Conference', 'Other'],
    required: true
  },
  achievementDate: { type: Date, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);