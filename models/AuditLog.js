const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'LOGIN', 'LOGOUT', 'SYSTEM_UPDATE', 'APPROVE_ACHIEVEMENT', 'REJECT_ACHIEVEMENT']
    },
    targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    details: {
        type: Object // Flexible field for extra info (diffs, error messages, etc.)
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: { createdAt: 'timestamp', updatedAt: false }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
