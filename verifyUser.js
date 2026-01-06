const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();
const connectDB = require('./config/db');

connectDB().then(async () => {
    try {
        const user = await User.findOne({ email: 'test@spit.ac.in' });
        console.log('User Found:', user ? user.email : 'Not Found');
    } catch (e) {
        console.error(e);
    }
    process.exit();
});
