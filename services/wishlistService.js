const asyncHandler = require('express-async-handler');
const User = require('../models/userModule');

// @doc     Add product to wishlist
// @route   POST /api/v1/wishlist
// @access  Protect/user
exports.addProductToWishlist = asyncHandler(async (req, res) => {
  // $addToSet add productId id to wishlist array if productId no exists
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: req.body.productId } },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    message: 'product added successfully to your wishlist',
    data: user.wishlist,
  });
});

// @doc     Remove product from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Protect/user
exports.removeProductFromWishlist = asyncHandler(async (req, res) => {
  // $pull remove productId from wishlist array if productId exists
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: req.params.productId } },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    message: 'product removed successfully from your wishlist',
    data: user.wishlist,
  });
});

// @doc     Get logged user wishlist
// @route   GET /api/v1/wishlist
// @access  Protect/user
exports.getLoggedUserWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.status(200).json({
    status: 'success',
    results: user.wishlist.length,
    data: user.wishlist,
  });
});
