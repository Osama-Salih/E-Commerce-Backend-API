const { check, body } = require('express-validator');
const slugify = require('slugify');
const validationMiddleware = require('../../middlewares/validatorMiddlewar');

exports.getBrandValidator = [
  check('id').isMongoId().withMessage('Invalid brand id format'),
  validationMiddleware,
];

exports.createBrandValidator = [
  check('name')
    .notEmpty()
    .withMessage('Brand required')
    .isLength({ min: 3 })
    .withMessage('Too short brand name')
    .isLength({ max: 32 })
    .withMessage('Too long brand name')
    .custom((val, { req }) => {
      if (req.body.name) {
        req.body.slug = slugify(val);
        return true;
      }
    }),
  validationMiddleware,
];

exports.updateBrandValidator = [
  check('id').isMongoId().withMessage('Invalid brand id format'),
  body('name')
    .optional()
    .custom((val, { req }) => {
      if (req.body.name) {
        req.body.slug = slugify(val);
        return true;
      }
    }),
  validationMiddleware,
];

exports.deleteBrandValidator = [
  check('id').isMongoId().withMessage('Invalid brand id format'),
  validationMiddleware,
];
