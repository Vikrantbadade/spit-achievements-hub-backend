const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  // e.g., "Publication", "FDP", "Patent", "Award"
  category: {
    type: String,
    enum: ['Publication', 'FDP', 'Patent', 'Award', 'Certification', 'Seminar', 'STTP', 'Project', 'Conference', 'Organised Conference', 'Workshop', 'Other'],
    required: true
  },
  subCategory: { type: String }, // e.g., "UGC Recognised Journal", "Attended"
  duration: { type: String }, // e.g., "5 days"
  startDate: { type: Date },
  endDate: { type: Date },
  fundedBy: { type: String },
  grantAmount: { type: Number },
  achievementDate: { type: Date, required: true },
  proof: { type: String },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);