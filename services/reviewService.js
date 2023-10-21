const factory = require('./handlersFactory');
const Review = require('../models/reviewModule');

// Nested route
// 127.0.0.1:8000/api/v1/products/productId/reviews
exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.filterObj = filterObject;
  next();
};

// @doc     Get list of reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = factory.getAll(Review);

// @doc     Get specific review by id
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = factory.getOne(Review);

exports.setProductIdAndUserIdToBody = (req, res, next) => {
  // nested route (create)
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;

  next();
};

// @doc    Create review
// @route  POST /api/v1/reviews
// @access Private/protect-user
exports.createReview = factory.createOne(Review);

// @doc     Update specific review by id
// @route   PUT /api/v1/reviews/:id
// @access  Private/protect-user
exports.updateReview = factory.updateOne(Review);

// @doc     Delete specific review by id
// @route   Delete /api/v1/reviews/:id
// @access  Private/protect-user-admin-manager
exports.deleteReview = factory.deleteOne(Review);
