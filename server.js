require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Connect Database
connectDB();


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));
app.use('/uploads', express.static('uploads'));
app.use(morgan('dev'));

// Routes
app.use('/api/v1/principal', require('./routes/principalRoutes'));
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/departments', require('./routes/deptRoutes'));
app.use('/api/v1/faculty', require('./routes/facultyRoutes'));
app.use('/api/v1/', require('./routes/adminRoutes'));
app.use('/api/v1/reports', require('./routes/reportRoutes'));
app.use('/api/v1/hod', require('./routes/hodRoutes'));
app.use('/api/v1/admin', require('./routes/superAdminRoutes'));
app.use('/api/v1/reports', require('./routes/reportRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));