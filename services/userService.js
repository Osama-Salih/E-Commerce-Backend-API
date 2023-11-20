const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');

const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');

const factory = require('./handlersFactory');
const ApiError = require('../utils/ApiError');
const createToken = require('../utils/createToken');
const User = require('../models/userModule');

// upload single image
exports.uploadUserImage = uploadSingleImage('profileImage');

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);

    // Save image into our db
    req.body.profileImage = filename;
  }
  next();
});

// @doc     Get list of users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = factory.getAll(User);

// @doc     Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = factory.getOne(User);

// @doc    Create user
// @route  POST /api/v1/users
// @access Private/Admin
exports.createUser = factory.createOne(User);

// @doc     Update specific user by id
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
      role: req.body.role,
      active: req.body.active,
    },
    {
      new: true,
    },
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      document,
    },
  });
});

// @doc     Update user password by id
// @route   PUT /api/v1/users//changePassword/:id
// @access  Private/Admin
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      PasswordChangedAt: Date.now(),
    },
    {
      new: true,
    },
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      document,
    },
  });
});
// @doc     Delete specific brand by id
// @route   Delete /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = factory.deleteOne(User);

// @doc     Get logged user data
// @route   GET /api/v1/users/getMe
// @access  Private/Protect/Admin
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @doc    Update logged user password
// @route   PUT /api/v1/users/changeMyPassword
// @access  Private/Protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res) => {
  // 1) update user password based on user payload (req.user._id)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      PasswordChangedAt: Date.now(),
    },
    {
      new: true,
    },
  );
  // 2) Generate token
  const token = createToken(user._id, res);
  res.status(200).json({
    status: 'success',
    data: {
      user,
      token,
    },
  });
});

// @doc    Update logged user data (without password, role)
// @route  PUT /api/v1/users/updateMe
// @access Private/Protect
exports.updateLoggedUserData = asyncHandler(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

// @doc    Deactivate logged user
// @route  DELETE /api/v1/users/deleteMe
// @access Private/Protect
exports.deleteLoggedUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({ status: 'success' });
});

// @doc    Reactivate logged user
// @route  GET /api/v1/users/reactivateMe
// @access Private/Protect
exports.reactivateLoggedUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { active: true });
  res.status(200).json({
    status: 'success',
    message: 'Account reactivate successfully',
  });
});
