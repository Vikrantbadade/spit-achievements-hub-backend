const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'gmail' or generic SMTP
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify connection configuration
const verifyConnection = async () => {
    if (process.env.NODE_ENV === 'test') return true; // Skip verification in test mode
    try {
        await transporter.verify();
        logger.info('Email Transporter Connected Successfully');
        return true;
    } catch (error) {
        logger.warn('Email Transporter Connection Failed: ' + error.message);
        // Don't crash the app if email fails, just log it
        return false;
    }
};

verifyConnection();

module.exports = transporter;
