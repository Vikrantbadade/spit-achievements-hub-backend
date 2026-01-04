const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      
      const token = jwt.sign(
        { userId: user._id, role: user.role, deptId: user.department },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Redirect Logic as per frontend
      let redirectPath = '/';
      if (user.role === 'Faculty') redirectPath = '/faculty';
      else if (user.role === 'HOD') redirectPath = '/hod';
      else if (user.role === 'Principal') redirectPath = '/principal';

      res.json({ token, role: user.role, redirectPath, user: { name: user.name, email: user.email } });
    } else {
      res.status(401).json({ message: 'Invalid Credentials' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};