require('dotenv').config();
const express = require('express');
const cors = require('cors');
const env = require('./config/env'); // Validate Env Vars immediately
const mongoose = require('mongoose');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Connect Database
connectDB();


const path = require('path');
const logger = require('./config/logger');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const hpp = require('hpp');
const xss = require('xss-clean');

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Data Sanitization
// Data Sanitization
app.use(mongoSanitize());
app.use(xss());

// Prevent Parameter Pollution
app.use(hpp());

// Swagger API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use(express.json());
app.use(express.static('uploads'));
app.use('/uploads', express.static('uploads'));
app.use(morgan('dev', { stream: { write: message => logger.info(message.trim()) } })); // Stream morgan logs to winston

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

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

// Graceful Shutdown
const gracefulShutdown = () => {
    logger.info('Received shutdown signal. Closing server...');
    server.close(() => {
        logger.info('HTTP server closed.');
        mongoose.connection.close(false, () => {
            logger.info('MongoDB connection closed.');
            process.exit(0);
        });
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);