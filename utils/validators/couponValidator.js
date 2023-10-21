const { body } = require('express-validator');
const validationMiddleware = require('../../middlewares/validatorMiddlewar');
const Coupon = require('../../models/couponModule');

exports.createCouponValidator = [
  body('name')
    .notEmpty()
    .withMessage('Coupon name required')
    .custom(async (val) => {
      const isCouponExist = await Coupon.findOne({ name: val });
      if (isCouponExist) {
        throw new Error('This coupon already exists');
      }
      return true;
    }),
  validationMiddleware,
];
