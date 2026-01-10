const User = require('../models/User');
const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/ApiResponse');

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate('department');
    if (user && (await user.matchPassword(password))) {

      const token = jwt.sign(
        { userId: user._id, role: user.role, deptId: user.department?._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Redirect Logic as per frontend
      let redirectPath = '/';
      if (user.role === 'Faculty') redirectPath = '/faculty';
      else if (user.role === 'HOD') redirectPath = '/hod';
      else if (user.role === 'Principal') redirectPath = '/principal';

      const data = {
        token,
        role: user.role,
        redirectPath,
        user: {
          name: user.name,
          email: user.email,
          department: user.department
        }
      };
      res.status(200).json(new ApiResponse(200, data, "Login Successful"));
    } else {
      res.status(401).json(new ApiResponse(401, null, "Invalid Credentials"));
    }
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};