const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

const { uploadMixOfImages } = require('../middlewares/uploadImageMiddleware');
const Product = require('../models/productModule');
const factory = require('./handlersFactory');

// upload mix of images
exports.uploadProductImages = uploadMixOfImages([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

// Image processing
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // 1- image processing for imageCover
  if (req.files.imageCover) {
    const imageCoverfileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverfileName}`);
    // Save image into our db
    req.body.imageCover = imageCoverfileName;
  }
  // 2- image processing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);
        // Save image into our db
        req.body.images.push(imageName);
      }),
    );
  }
  next();
});

// @doc     Get list of products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = factory.getAll(Product, 'Product');

// @doc     Get specific product by id
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = factory.getOne(Product, 'reviews');

// @doc    Create product
// @route  POST /api/v1/products
// @access Private/admin-manager
exports.createProduct = factory.createOne(Product);

// @doc     Update specific product by id
// @route   PUT /api/v1/products/:id
// @access  Private/admin-manager
exports.updateProduct = factory.updateOne(Product);

// @doc     Delete specific product by id
// @route   Delete /api/v1/products/:id
// @access  Private-admin
exports.deleteProduct = factory.deleteOne(Product);
