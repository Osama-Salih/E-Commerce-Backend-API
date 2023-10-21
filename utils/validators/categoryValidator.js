const { check, body } = require('express-validator');
const slugify = require('slugify');
const validationMiddleware = require('../../middlewares/validatorMiddlewar');

exports.getCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid category id format'),
  validationMiddleware,
];

exports.createCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('Category required')
    .isLength({ min: 3 })
    .withMessage('Too short category name')
    .isLength({ max: 32 })
    .withMessage('Too long category name')
    .custom((val, { req }) => {
      if (req.body.name) {
        req.body.slug = slugify(val);
        return true;
      }
    }),
  validationMiddleware,
];

exports.updateCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid category id format'),
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

exports.deleteCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid category id format'),
  validationMiddleware,
];
