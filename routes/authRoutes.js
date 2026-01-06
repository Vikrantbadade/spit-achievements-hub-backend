const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign(
        { userId: user._id, role: user.role, deptId: user.department },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      let redirectPath = '/';
      if (user.role === 'Faculty') redirectPath = '/faculty';
      else if (user.role === 'HOD') redirectPath = '/hod';
      else if (user.role === 'Principal') redirectPath = '/principal';

      res.json({ token, role: user.role, redirectPath, user: { name: user.name, email: user.email } });
    } else {
      res.status(401).json({ message: 'Invalid Credentials' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
});




// POST /api/v1/auth/create-user
router.post('/create-user', protect, authorize('Principal', 'HOD'), async (req, res,next) => {
  try {
    const { name, email, password, role, department } = req.body;

    
    if (req.user.role === 'HOD') {
      
      if (role !== 'Faculty') {
        return res.status(403).json({ message: 'HOD can only create Faculty accounts.' });
      }
      if (department !== req.user.department.toString()) {
        return res.status(403).json({ message: 'HOD can only add Faculty to their own department.' });
      }
    }


    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    
    const user = await User.create({
      name,
      email,
      password, 
      role,
      department
    });

    res.status(201).json({ 
      message: 'User created successfully', 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;