require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Department = require('./models/Department');
const Achievement = require('./models/Achievement');
const connectDB = require('./config/db');

const seedData = async () => {
  await connectDB();
  await User.deleteMany(); await Department.deleteMany(); await Achievement.deleteMany();

  const comp = await Department.create({ name: 'Computer Engineering', code: 'COMP' });
  const extc = await Department.create({ name: 'Electronics & Telecom', code: 'EXTC' });
  const cse = await Department.create({ name: 'Comp Sci & Eng (DS)', code: 'CSE' });

  await User.create({ name: 'Dr. Principal', email: 'principal@spit.ac.in', password: 'password123', role: 'Principal' });
  await User.create({ name: 'HOD Computer', email: 'hod@comp.spit.ac.in', password: 'password123', role: 'HOD', department: comp._id });
  await User.create({ name: 'Prof. Sharma', email: 'sharma@comp.spit.ac.in', password: 'password123', role: 'Faculty', department: comp._id });

  console.log('Database Seeded! Login: principal@spit.ac.in / password123');
  process.exit();
};
seedData();