const { body } = require('express-validator');
const validationMiddleware = require('../../middlewares/validatorMiddlewar');
const Product = require('../../models/productModule');

exports.addProductToWishlistValidator = [
  body('productId')
    .notEmpty()
    .withMessage('product id required')
    .isMongoId()
    .withMessage('Invalid product id')
    .custom(async (val) => {
      const product = await Product.findById(val);
      if (!product) {
        throw new Error(`There is no product with this id ${val}`);
      }

      return true;
    }),
  validationMiddleware,
];
