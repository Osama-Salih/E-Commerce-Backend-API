const express = require('express');
const authService = require('../services/authService');
const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
} = require('../services/wishlistService');
const {
  addProductToWishlistValidator,
} = require('../utils/validators/wishlistValidator');

const router = express.Router();

router.use(authService.protect, authService.allowedTo('user'));

router
  .route('/')
  .post(addProductToWishlistValidator, addProductToWishlist)
  .get(getLoggedUserWishlist);
router.delete('/:productId', removeProductFromWishlist);

module.exports = router;
