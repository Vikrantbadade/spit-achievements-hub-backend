const mongoose = require('mongoose');
const Achievement = require('./models/Achievement');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

const checkData = async () => {
    try {
        await connectDB();

        const userCount = await User.countDocuments();
        const achievementCount = await Achievement.countDocuments();

        console.log(`Users: ${userCount}`);
        console.log(`Achievements: ${achievementCount}`);

        if (achievementCount > 0) {
            const sample = await Achievement.findOne().populate('faculty');
            console.log("Sample Achievement:", JSON.stringify(sample, null, 2));
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkData();
