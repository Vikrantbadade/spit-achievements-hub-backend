const mongoose = require('mongoose');
const Department = require('./models/Department');
require('dotenv').config();
const connectDB = require('./config/db');

connectDB().then(async () => {
    try {
        const result = await Department.deleteMany({
            code: { $in: ['IT', 'MECH', 'INST'] }
        });
        console.log(`Deleted ${result.deletedCount} departments (IT, MECH, INST).`);

        const remaining = await Department.find({}, 'name code');
        console.log('Remaining Departments:', remaining.map(d => d.code).join(', '));
    } catch (e) {
        console.error(e);
    }
    process.exit();
});
