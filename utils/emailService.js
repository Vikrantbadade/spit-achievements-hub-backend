const transporter = require('../config/email');
const logger = require('../config/logger');

const sendEmail = async (to, subject, text, html) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        logger.warn('Email credentials missing. Email not sent to: ' + to);
        return;
    }

    try {
        await transporter.sendMail({
            from: `"SPIT Achievements Hub" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });
        logger.info(`Email sent to ${to} for subject: ${subject}`);
    } catch (error) {
        logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
};

const sendApprovalNotification = async (facultyEmail, facultyName, achievementTitle) => {
    const subject = 'Achievement Approved - SPIT Achievements Hub';
    const text = `Dear ${facultyName},\n\nYour achievement "${achievementTitle}" has been APPROVED by the HOD/Admin.\n\nRegards,\nSPIT Achievements Hub`;
    const html = `
        <h3>Achievement Approved</h3>
        <p>Dear <strong>${facultyName}</strong>,</p>
        <p>Your achievement <strong>"${achievementTitle}"</strong> has been <span style="color: green; font-weight: bold;">APPROVED</span>.</p>
        <br/>
        <p>Regards,<br/>SPIT Achievements Hub</p>
    `;
    await sendEmail(facultyEmail, subject, text, html);
};

const sendRejectionNotification = async (facultyEmail, facultyName, achievementTitle, reason) => {
    const subject = 'Achievement Rejected - SPIT Achievements Hub';
    const text = `Dear ${facultyName},\n\nYour achievement "${achievementTitle}" has been REJECTED.\nReason: ${reason}\n\nPlease login to correct and resubmit.\n\nRegards,\nSPIT Achievements Hub`;
    const html = `
        <h3>Achievement Rejected</h3>
        <p>Dear <strong>${facultyName}</strong>,</p>
        <p>Your achievement <strong>"${achievementTitle}"</strong> has been <span style="color: red; font-weight: bold;">REJECTED</span>.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please login to the portal to edit and resubmit.</p>
        <br/>
        <p>Regards,<br/>SPIT Achievements Hub</p>
    `;
    await sendEmail(facultyEmail, subject, text, html);
};

const sendNewSubmissionNotification = async (hodEmail, facultyName, achievementTitle) => {
    const subject = 'New Achievement Received - Action Required';
    const text = `Dear HOD,\n\nFaculty ${facultyName} has submitted a new achievement: "${achievementTitle}".\n\nPlease login to review it.\n\nRegards,\nSPIT Achievements Hub`;
    const html = `
        <h3>New Achievement Submission</h3>
        <p>Dear HOD,</p>
        <p>Faculty <strong>${facultyName}</strong> has submitted a new achievement:</p>
        <p><strong>"${achievementTitle}"</strong></p>
        <p>Please login to the Admin/HOD Portal to review and approve/reject.</p>
        <br/>
        <p>Regards,<br/>SPIT Achievements Hub</p>
    `;
    await sendEmail(hodEmail, subject, text, html);
};

module.exports = {
    sendApprovalNotification,
    sendRejectionNotification,
    sendNewSubmissionNotification
};
