const express = require('express');

const {
  createCashOrder,
  getAllOrders,
  getSpecificOrder,
  filterOrdersForLoggedUser,
  updateOrderStatusToPaid,
  updateOrderStatusToDelivered,
  checkoutSession,
} = require('../services/orderService');

const {
  createOrderValidator,
  getOrderValidator,
} = require('../utils/validators/orderValidator');
const authService = require('../services/authService');

const router = express.Router();
router.use(authService.protect);

router
  .route('/checkout-session/:cartId')
  .get(authService.allowedTo('user'), checkoutSession);

router
  .route('/:cartId')
  .post(authService.allowedTo('user'), createOrderValidator, createCashOrder);
router
  .route('/')
  .get(
    authService.allowedTo('user', 'admin', 'manager'),
    filterOrdersForLoggedUser,
    getAllOrders,
  );
router
  .route('/:id')
  .get(
    authService.allowedTo('user', 'admin'),
    getOrderValidator,
    getSpecificOrder,
  );
router
  .route('/:id/pay')
  .put(authService.allowedTo('manager', 'admin'), updateOrderStatusToPaid);
router
  .route('/:id/delivered')
  .put(authService.allowedTo('manager', 'admin'), updateOrderStatusToDelivered);
module.exports = router;
