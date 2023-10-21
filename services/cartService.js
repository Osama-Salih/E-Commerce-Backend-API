const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');

const Product = require('../models/productModule');
const Coupon = require('../models/couponModule');
const Cart = require('../models/cartModule');

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });

  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

// @doc     Add product to cart
// @route   POST /api/v1/carts
// @access  Protecte/user
exports.addProductToCart = asyncHandler(async (req, res) => {
  const { productId, color } = req.body;
  const product = await Product.findById(productId);

  // 1) Get cart for logged user
  let cart = await Cart.findOne({ user: req.user._id });

  //2 Create cart for logged user with product
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{ product: productId, color, price: product.price }],
    });
  } else {
    //if  product exist in cart update cuantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color,
    );
    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    } else {
      // if product not exist, push product to cartItems array
      cart.cartItems.push({ product: productId, color, price: product.price });
    }
  }

  // calc total cart price
  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Product added successfully to your cart',
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @doc     get logged user cart
// @route   POST /api/v1/carts
// @access  Protecte/user
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError(`There is no cart for this user`, 404));
  }

  calcTotalCartPrice(cart);
  res.status(200).json({
    status: 'success',
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @doc     Remove Specific Cart Item by id
// @route   DELET /api/v1/carts/:id
// @access  Protecte/user
exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true },
  );

  calcTotalCartPrice(cart);
  await cart.save();
  res.status(200).json({
    status: 'success',
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @doc     Clear Logged user Cart
// @route   DELET /api/v1/carts
// @access  Protecte/user
exports.clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});

// @doc    Update cart item quantity
// @route   PUT /api/v1/carts/:itemId
// @access  Protecte/user
exports.UpdateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`There is no cart for this user id ${req.user._id}`, 404),
    );
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId,
  );

  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(
      new ApiError(`There is no item with this id ${req.params.itemId}`, 404),
    );
  }

  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    status: 'success',
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @doc    Update cart item color
// @route   PUT /api/v1/carts/:itemId
// @access  Protecte/user
exports.UpdateCartItemColor = asyncHandler(async (req, res, next) => {
  const { color } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`There is no cart for this user id ${req.user._id}`, 404),
    );
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId,
  );

  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.color = color;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(
      new ApiError(`There is no item with this id ${req.params.itemId}`, 404),
    );
  }

  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    status: 'success',
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @doc     Aplly coupon on logged user cart
// @route   PUT /api/v1/carts/apply-coupon
// @access  Protecte/user
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // // 1) Get coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });

  if (!coupon) {
    return next(new ApiError(`This coupon is invalid or expired`, 404));
  }

  // 2) Get logged user cart to get total cart price
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`There is no cart for this user id ${req.user._id}`, 404),
    );
  }

  const totalPrice = cart.totalCartPrice;

  // 3) Calc price after discount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);
  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;

  await cart.save();

  res.status(200).json({
    status: 'success',
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
