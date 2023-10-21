const { check, body } = require('express-validator');
const slugify = require('slugify');
const validationMiddleware = require('../../middlewares/validatorMiddlewar');
const Category = require('../../models/categoryModule');
const SubCategory = require('../../models/subCategoryModule');

exports.createProductValidator = [
  check('title')
    .notEmpty()
    .withMessage('Product title required')
    .isLength({ min: 3 })
    .withMessage('Product must be at least 3 chars')
    .isLength({ max: 100 })
    .withMessage('Product must be at most 100 chars')
    .custom((val, { req }) => {
      if (req.body.title) {
        req.body.slug = slugify(val);
        return true;
      }
    }),
  check('description')
    .notEmpty()
    .withMessage('Product description required')
    .isLength({ max: 2000 })
    .withMessage('Too long description'),
  check('quantity')
    .notEmpty()
    .withMessage('Product quantity required')
    .isNumeric()
    .withMessage('Product quantity must be a number'),
  check('sold')
    .optional()
    .isNumeric()
    .withMessage('Product sold must be a number'),
  check('price')
    .notEmpty()
    .withMessage('Product price required')
    .isNumeric()
    .withMessage('Product price must be a number')
    .isLength({ max: 32 })
    .withMessage('Too long price'),
  check('priceAfterDiscount')
    .optional()
    .isNumeric()
    .withMessage('price after discount must be a number')
    .toFloat()
    .custom((value, { req }) => {
      if (value > req.body.price) {
        throw new Error('Price after discount must be lower then price');
      }
      return true;
    }),
  check('colors')
    .optional()
    .isArray()
    .withMessage('Colors must be array of strings'),
  check('imageCover').notEmpty().withMessage('Product image cover required'),
  check('images')
    .optional()
    .isArray()
    .withMessage('images must be array of strings'),
  check('category')
    .notEmpty()
    .withMessage('Product must be belong to category')
    .isMongoId()
    .withMessage('Invalid Id formate')
    .custom(async (category) => {
      const categoryId = await Category.findById(category);
      if (!categoryId) {
        throw new Error(`No category for this id: ${category}`);
      }
    }),
  check('subcategories')
    .optional()
    .isMongoId()
    .withMessage('Invalid Id formate')
    .custom(async (subcategoryIds) => {
      const results = await SubCategory.find({
        _id: { $exists: true, $in: subcategoryIds },
      });
      if (results.length < 1 || results.length !== subcategoryIds.length) {
        throw new Error('Invalid subcategory ids');
      }
    })
    .custom(async (val, { req }) => {
      const subcategories = await SubCategory.find({
        category: req.body.category,
      });
      const subCategoriesIndsInDB = [];
      subcategories.forEach((subCategory) => {
        subCategoriesIndsInDB.push(subCategory._id.toString());
      });

      // checke if subcategories ids in db includes subcategories in req.body (true, false)
      const checker = (target, arr) => target.every((v) => arr.includes(v));
      if (!checker(val, subCategoriesIndsInDB)) {
        throw new Error(`subcategories not belong to category`);
      }
    }),

  check('brand').optional().isMongoId().withMessage('Invalid Id formate'),
  check('ratingsAverage')
    .optional()
    .isNumeric()
    .withMessage('Ratings average must be a number')
    .isLength({ min: 1 })
    .withMessage('Rating must be above or equal to 1.0')
    .isLength({ max: 5 })
    .withMessage('Rating must be below or equal to 5.0'),
  check('ratingsQuantity')
    .optional()
    .isNumeric()
    .withMessage('Ratings quantity must be a number'),
  validationMiddleware,
];

exports.getProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID formate'),
  validationMiddleware,
];

exports.updateProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID formate'),
  body('title')
    .optional()
    .custom((val, { req }) => {
      if (req.body.title) {
        req.body.slug = slugify(val);
        return true;
      }
    }),
  validationMiddleware,
];
exports.deleteProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID formate'),
  validationMiddleware,
];
