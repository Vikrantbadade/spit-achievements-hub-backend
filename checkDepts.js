const mongoose = require('mongoose');
const Department = require('./models/Department');
require('dotenv').config();
const connectDB = require('./config/db');

connectDB().then(async () => {
    try {
        const count = await Department.countDocuments();
        console.log('Department Count:', count);
        if (count === 0) {
            await Department.create({ name: 'Computer Engineering', code: 'COMP' });
            await Department.create({ name: 'Information Technology', code: 'IT' });
            await Department.create({ name: 'Electronics and Telecommunication', code: 'EXTC' });
            console.log('Seeded Departments');
        }
    } catch (e) {
        console.error(e);
    }
    process.exit();
});
