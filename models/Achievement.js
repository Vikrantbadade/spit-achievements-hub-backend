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
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  rejectionReason: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date }
}, { timestamps: true });

// Indexes for performance
achievementSchema.index({ faculty: 1 });
achievementSchema.index({ department: 1 });
achievementSchema.index({ status: 1 });
achievementSchema.index({ category: 1 });


module.exports = mongoose.model('Achievement', achievementSchema);