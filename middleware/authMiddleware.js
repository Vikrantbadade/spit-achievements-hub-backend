const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization) {
    try {
      token = req.headers.authorization;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
      next();
    } catch (error) { res.status(401).json({ message: 'Not authorized' }); }
  } else { res.status(401).json({ message: 'No token' }); }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists AND if their role is allowed
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
module.exports = { protect, authorize };