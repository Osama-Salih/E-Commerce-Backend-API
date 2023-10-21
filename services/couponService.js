const factory = require('./handlersFactory');
const Coupon = require('../models/couponModule');

// @doc     Get list of coupons
// @route   GET /api/v1/coupons
// @access  Protecte/Admin-Manager
exports.getCoupons = factory.getAll(Coupon);

// @doc     Get specific coupon by id
// @route   GET /api/v1/coupons/:id
// @access  Protecte/Admin-Manager
exports.getCoupon = factory.getOne(Coupon);

// @doc    Create coupon
// @route  POST /api/v1/coupons
// @access  Protecte/Admin-Manager
exports.createCoupon = factory.createOne(Coupon);

// @doc     Update specific coupon by id
// @route   PUT /api/v1/coupons/:id
// @access Protecte/Admin-Manager
exports.updateCoupon = factory.updateOne(Coupon);

// @doc     Delete specific coupon by id
// @route   Delete /api/v1/coupons/:id
// @access Protecte/Admin-Manager
exports.deleteCoupon = factory.deleteOne(Coupon);
