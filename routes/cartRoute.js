const express = require('express');

const {
  addProductToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  clearCart,
  UpdateCartItemQuantity,
  UpdateCartItemColor,
  applyCoupon,
} = require('../services/cartService');

const router = express.Router();
const authService = require('../services/authService');

router.use(authService.protect, authService.allowedTo('user'));
router
  .route('/')
  .get(getLoggedUserCart)
  .post(addProductToCart)
  .delete(clearCart);

router.put('/apply-coupon', applyCoupon);

router.put('/:itemId/quantity', UpdateCartItemQuantity);
router.put('/:itemId/color', UpdateCartItemColor);
router.delete('/:itemId', removeSpecificCartItem);

module.exports = router;
