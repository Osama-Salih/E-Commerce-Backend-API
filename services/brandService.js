const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');

const factory = require('./handlersFactory');
const Brand = require('../models/brandModule');

// upload single image
exports.uploadBrandImage = uploadSingleImage('image');

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat('jpeg')
    .jpeg({ quality: 95 })
    .toFile(`uploads/brands/${filename}`);

  // Save image into our db
  req.body.image = filename;
  next();
});

// @doc     Get list of brands
// @route   GET /api/v1/brands
// @access  Public
exports.getBrands = factory.getAll(Brand);

// @doc     Get specific brand by id
// @route   GET /api/v1/brands/:id
// @access  Public
exports.getBrand = factory.getOne(Brand);

// @doc    Create brand
// @route  POST /api/v1/brands
// @access Private/admin-manager
exports.createBrand = factory.createOne(Brand);

// @doc     Update specific brand by id
// @route   PUT /api/v1/brands/:id
// @access  Private/admin-manager
exports.updateBrand = factory.updateOne(Brand);

// @doc     Delete specific brand by id
// @route   Delete /api/v1/brands/:id
// @access  Private/admin
exports.deleteBrand = factory.deleteOne(Brand);
