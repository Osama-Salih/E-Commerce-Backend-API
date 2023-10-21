const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

const factory = require('./handlersFactory');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const Category = require('../models/categoryModule');

// upload single image
exports.uploadCategoryImage = uploadSingleImage('image');

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat('jpeg')
    .jpeg({ quality: 95 })
    .toFile(`uploads/categories/${filename}`);
  // Save image into our db
  req.body.image = filename;
  next();
});

// @doc     Get list of categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = factory.getAll(Category);

// @doc     Get specific category by id
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = factory.getOne(Category);

// @doc    Create category
// @route  POST /api/v1/categories
// @access Private/admin-manager
exports.createCategory = factory.createOne(Category);

// @doc     Update specific category by id
// @route   PUT /api/v1/categories/:id
// @access  Private/admin-manager
exports.updateCategory = factory.updateOne(Category);

// @doc     Delete specific category by id
// @route   Delete /api/v1/categories/:id
// @access  Private/admin
exports.deleteCategory = factory.deleteOne(Category);
