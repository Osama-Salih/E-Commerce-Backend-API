const { check } = require('express-validator');
const Review = require('../../models/reviewModule');
const validationMiddleware = require('../../middlewares/validatorMiddlewar');

exports.createReviewValidator = [
  check('title').optional(),
  check('ratings')
    .notEmpty()
    .withMessage('Ratings value required')
    .isFloat({ min: 1.0, max: 5.0 })
    .withMessage('value must be between 1 to 5'),
  check('user').isMongoId().withMessage('Invalid Review id format'),
  check('product')
    .isMongoId()
    .withMessage('Invalid Review id format')
    .custom(async (val, { req }) => {
      // check if logged user create review before
      const review = await Review.findOne({
        user: req.user._id,
        product: req.body.product,
      });

      if (review) {
        throw new Error('You already have a review before');
      }
    }),

  validationMiddleware,
];

exports.getReviewValidator = [
  check('id').isMongoId().withMessage('Invalid Review id format'),
  validationMiddleware,
];

exports.updateReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Review id format')
    .custom(async (val, { req }) => {
      // check review ownership before update
      const review = await Review.findById(val);
      if (!review) {
        throw new Error(`There is no review with this id ${val}`);
      }

      if (review.user._id.toString() !== req.user._id.toString()) {
        throw new Error('You are not allowed to preform this action');
      }

      return true;
    }),

  validationMiddleware,
];

exports.deleteReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Review id format')
    .custom(async (val, { req }) => {
      // check review ownership before deleting
      const review = await Review.findById(val);
      if (!review) {
        throw new Error(`There is no review with this id ${val}`);
      }

      if (
        req.user.role === 'user' &&
        review.user._id.toString() !== req.user._id.toString()
      ) {
        throw new Error('You are not allowed to preform this action');
      }

      return true;
    }),
  validationMiddleware,
];
