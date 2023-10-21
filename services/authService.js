const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const sendEmail = require('../utils/sendEmail');
const createToken = require('../utils/createToken');
const User = require('../models/userModule');

// @desc    Signup
// @route   POST /api/v1/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res) => {
  // 1 create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  // 2 generate token
  const token = createToken(user._id);

  res.status(201).json({
    status: 'success',
    data: {
      user,
      token,
    },
  });
});

// @desc    Login
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  // 2. check if user exist & check if password is correct
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError('Invalid email or password', 401));
  }
  // 3. generate token
  const token = createToken(user._id);
  // 4. send response to client side
  res.status(200).json({
    status: 'success',
    data: {
      user,
      token,
    },
  });
});

// @desc Make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1. Check if token exist, if exist get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new ApiError('You are not login, please login to access this route', 401),
    );
  }

  // 2. Verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // // 3. Check if user exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError('The user belong to this token no longer exist', 401),
    );
  }

  // 5. Check if user active
  if (req.url !== '/reactivateMe' && !currentUser.active) {
    return next(new ApiError('User Account Inactive', 403));
  }

  // 5. Check if user active

  // 6. Check if user change his password after token created
  if (currentUser.PasswordChangedAt) {
    const passwordChangeTimestamp = parseInt(
      currentUser.PasswordChangedAt.getTime() / 1000,
      10,
    );

    // Password changed after token created (error)
    if (passwordChangeTimestamp > decoded.iat) {
      return next(
        new ApiError(
          'User recently changed his password after token created',
          401,
        ),
      );
    }
  }

  req.user = currentUser;
  next();
});

// @desc Authorization (User Permission)
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    //1 access roles
    //2 access registered user
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError('You are not allowed to access this route', 403),
      );
    }
    next();
  });

// @desc    forgotPassword
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with that email: ${req.body.email}`, 404),
    );
  }
  // 2) if user exist, Generate hash random reset 6 digit, and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

  // Save hashed password reset code into db
  user.PasswordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.PasswordResetCodeExpired = Date.now() + 10 * 60 * 1000;
  user.PasswordResetCodeVerified = false;

  await user.save();

  const message = `Hi ${user.name}, \nWe received a request to reset the password on your E-shop Account. ${resetCode} \n Thanks for helping us keep your account secure. \n The E-shop Team`;

  // 3) send resit code via email
  try {
    await sendEmail({
      email: user.email,
      subject: `${user.name}, here's your PIN ${resetCode}`,
      message,
    });
  } catch (err) {
    user.PasswordResetCode = undefined;
    user.PasswordResetCodeExpired = undefined;
    user.PasswordResetCodeVerified = undefined;

    await user.save();
    return next(
      new ApiError('There was an error while sending the email', 500),
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Reset code sent to your email',
  });
});

// @desc    Verify Reset Code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // Get user based on reset code
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');

  const user = await User.findOne({
    PasswordResetCode: hashedResetCode,
    PasswordResetCodeExpired: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError('Invalid reset code or expired', 404));
  }
  // valid reset code
  user.PasswordResetCodeVerified = true;
  await user.save();
  res.status(200).json({ status: 'success' });
});

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ApiError('There is no user with that email', 404));
  }

  // 2) Check if reset code verified
  if (!user.PasswordResetCodeVerified) {
    return next(new ApiError('Reset code is not verified', 400));
  }

  user.password = req.body.newPassword;
  user.PasswordResetCode = undefined;
  user.PasswordResetCodeExpired = undefined;
  user.PasswordResetCodeVerified = undefined;

  await user.save();
  // 3) if everything is ok, generat token
  const token = createToken(user._id);
  res.status(200).json({ status: 'success', token });
});
