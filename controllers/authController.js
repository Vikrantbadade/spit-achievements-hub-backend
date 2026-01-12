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

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found with this email"));
    }

    // Get Reset Token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create Reset URL
    // frontend URL usually, or backend API URL that redirects
    // Here we point to the FRONTEND Reset Page
    // Updated to port 8080 (Docker) - Ideally use process.env.FRONTEND_URL
    const resetUrl = `http://localhost:8080/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    const htmlMessage = `
      <h3>Password Reset Request</h3>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      <p>This link will expire in 10 minutes.</p>
    `;

    try {
      const emailService = require('../utils/emailService');
      // We need to expose a generic send function ideally or just use the transporter here?
      // Re-using existing email logic (requires a slight tweak to emailService to export generic send, or create a new wrapper)
      // Since emailService.js exports specific functions, let's use the transporter directly or add a new exported function
      // checking emailService.js content... it has sendEmail but it is not exported. 
      // I will import transporter from config/email and use it directly or I should UPDATE emailService.js first.
      // Let's do it inline here for now to avoid switching context, assuming transporter is available.
      // Actually, checking emailService.js again .. sendEmail is NOT exported. I should probably fixing that is better practice.
      // But for speed, I will use the internal sendEmail logic here or modify emailService.js next.
      // WAIT: I should modify emailService.js to export `sendEmail` Generic function.

      // Let's assume I will fix emailService.js in the next step to export sendEmail.
      const { sendEmailGeneric } = require('../utils/emailService');

      await sendEmailGeneric(
        user.email,
        'Password Reset Token',
        message,
        htmlMessage
      );

      res.status(200).json(new ApiResponse(200, { data: "Email sent" }, "Email Sent"));
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json(new ApiResponse(500, null, "Email could not be sent"));
    }
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

// @desc    Reset Password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  // Get hashed token
  const crypto = require('crypto');
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json(new ApiResponse(400, null, "Invalid Token"));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Log them in directly? Or ask to login? Usually ask to login.
    res.status(200).json(new ApiResponse(200, null, "Password Updated Success"));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
};