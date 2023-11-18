const stripe = require('stripe')(process.env.STRIPE_SECRET);
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const factory = require('./handlersFactory');
const Product = require('../models/productModule');
const Cart = require('../models/cartModule');
const User = require('../models/userModule');
const Order = require('../models/orderModule');

//@desc decrement product quantity, increment product sold
const updateProductSales = async (cartItems, cartId) => {
  const blukOption = cartItems.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
    },
  }));
  await Product.bulkWrite(blukOption, {});

  // Clear cart depend on cartId
  await Cart.findByIdAndDelete(cartId);
};

// @desc   Create cash order
// @route  POST /api/v1/orders/cartId
// @access Protecte/user
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // App settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no such cart with this id ${req.params.cartId}`),
    );
  }
  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  // 3) Create order with default paymentMethodType cash
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });
  // 4) After creating order, decrement product quantity, increment product sold
  if (order) {
    updateProductSales(cart.cartItems, req.params.cartId);
  }

  res.status(201).json({
    status: 'success',
    data: order,
  });
});

exports.filterOrdersForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'user') req.filterObj = { user: req.user._id };
  next();
});

// @desc   Get all orders
// @route  GET /api/v1/orders
// @access Protecte/user-admin-manager
exports.getAllOrders = factory.getAll(Order);

// @desc   Get specific order by id
// @route  GET /api/v1/orders/:id
// @access Protecte/user-admin-manager
exports.getSpecificOrder = factory.getOne(Order);

// @desc   Update order paid status to paid
// @route  PUT /api/v1/orders/:id/pay
// @access Protecte/admin-manager
exports.updateOrderStatusToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(`There is no such order with this id ${req.params.id}`, 404),
    );
  }
  // update order paid status
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();
  res.status(200).json({ status: 'success', data: updatedOrder });
});

// @desc   Update order delivered status
// @route  PUT /api/v1/orders/:id/delivered
// @access Protecte/admin-manager
exports.updateOrderStatusToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(`There is no such order with this id ${req.params.id}`, 404),
    );
  }
  // update order delivered status
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();
  res.status(200).json({ status: 'success', data: updatedOrder });
});

// @desc   Get checkout session from stripe and send it as response
// @route  GET /api/v1/orders/checkout-session/cartId
// @access Protecte/user
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // App settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no such cart with this id ${req.params.cartId}`),
    );
  }
  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  // 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          unit_amount: totalOrderPrice * 100,
          currency: 'sar',
          product_data: {
            name: req.user.name,
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/orders`,
    cancel_url: `${req.protocol}://${req.get('host')}/carts`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });
  //4 Send session to response
  res.status(200).json({ status: 'success', session });
});

const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const orderPrice = session.amount_total / 100;
  const shippingAddress = session.metadata;

  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  // Create order with payment Method Type card
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    totalOrderPrice: orderPrice,
    paymentMethodPrice: 'card',
    isPaid: 'true',
    paidAt: Date.now(),
    shippingAddress,
  });

  if (order) {
    updateProductSales(cart.cartItems, cartId);
  }
};

// @desc   This webhook will run when stripe payment success paid.
// @route  POST /webhook-checkout
// @access Protecte/user
exports.webhookCheckout = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    createCardOrder(event.data.object);
  }

  res.status(200).json({ received: true });
};
