const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {

    try {
      // ✅ Extract ONLY the token
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded) {
  return res.status(401).json({ message: "Token expired" });
}


      req.user = await User.findById(decoded.userId).select("-password");

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};


const authorize = (...roles) => {
  return (req, res, next) => {
    
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
module.exports = { protect, authorize };