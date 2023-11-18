const { check, body } = require('express-validator');
const validationMiddleware = require('../../middlewares/validatorMiddlewar');
const Order = require('../../models/orderModule');

exports.getOrderValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid order id format')
    .custom(async (val, { req }) => {
      const order = await Order.findOne({ _id: val, user: req.user._id });
      if (!order) {
        throw new Error("You don't have order yet!");
      }
      return true;
    }),
  validationMiddleware,
];

exports.createOrderValidator = [
  body('shippingAddress').optional(),
  body('shippingAddress.details')
    .notEmpty()
    .withMessage('This field is required'),
  body('shippingAddress.phone')
    .notEmpty()
    .withMessage('This field is required')
    .isMobilePhone('ar-SA')
    .withMessage('Invalid phone number only accept Saudi Arabian phone number'),

  body('shippingAddress.city').notEmpty().withMessage('This field is required'),

  body('shippingAddress.postalCode')
    .notEmpty()
    .withMessage('This field is required')
    .isPostalCode('SA')
    .withMessage('Invalid postal code, only accept Saudi Arabian postal codes'),
  validationMiddleware,
];
