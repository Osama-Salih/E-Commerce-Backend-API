const { check, body } = require('express-validator');
const slugify = require('slugify');
const validationMiddleware = require('../../middlewares/validatorMiddlewar');

exports.getSubCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid subCategory id format'),
  validationMiddleware,
];

exports.createSubCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('SubCategory required')
    .isLength({ min: 2 })
    .withMessage('Too short subCategory name')
    .isLength({ max: 32 })
    .withMessage('Too long subCategory name')
    .custom((val, { req }) => {
      if (req.body.name) {
        req.body.slug = slugify(val);
        return true;
      }
    }),
  check('category')
    .notEmpty()
    .withMessage('subCategory must be belong to category')
    .isMongoId()
    .withMessage('Invalid subCategory id format'),
  validationMiddleware,
];

exports.updateSubCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid subCategory id format'),
  body('name').custom((val, { req }) => {
    if (req.body.name) {
      req.body.slug = slugify(val);
      return true;
    }
  }),
  validationMiddleware,
];

exports.deleteSubCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid subCategory id format'),
  validationMiddleware,
];
