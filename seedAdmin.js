require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedAdmin = async () => {
    await connectDB();

    const adminEmail = 'admin@spit.ac.in';
    const userExists = await User.findOne({ email: adminEmail });

    if (userExists) {
        console.log('Admin user already exists');
        process.exit();
    }

    const admin = await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: 'admin123', // Change this in production
        role: 'Admin',
        department: null
    });

    console.log(`Admin user created: ${admin.email}`);
    process.exit();
};

seedAdmin();
