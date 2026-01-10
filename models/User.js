// TITLE: User Model with Secure and Plain Password Storage
// This model defines the user schema including roles, departments, and password handling.
// NOTE: 'plainPassword' is included for Admin visibility as per user requirements (Insecure by design).
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Faculty', 'HOD', 'Principal', 'Admin'],
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: function () { return this.role !== 'Principal' && this.role !== 'Admin'; }
  },
  plainPassword: { type: String } // INSECURE: Storing plain text password for Admin view
});

// Indexes for performance
// email already indexed by unique: true
userSchema.index({ department: 1 });
userSchema.index({ role: 1 });


userSchema.pre('save', async function () {
  // 1. If password is not modified, return early
  if (!this.isModified('password')) return;

  // 2. Capture plain password for Admin visibility before hashing
  this.plainPassword = this.password;

  // 3. Hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // No need to call next()
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);