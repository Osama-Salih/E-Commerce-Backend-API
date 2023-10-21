const asyncHandler = require('express-async-handler');
const User = require('../models/userModule');

// @doc     Add address to user addresses
// @route   POST /api/v1/addresses
// @access  Protect/user
exports.addAddress = asyncHandler(async (req, res) => {
  // $addToSet add address object to addresses array if address no exists
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { addresses: req.body } },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    message: 'address added successfully',
    results: user.addresses.length,
    data: user.addresses,
  });
});

// @doc     Remove address from addresses
// @route   DELETE /api/v1/wishlist/:addressId
// @access  Protect/user
exports.removeAddress = asyncHandler(async (req, res) => {
  // $pull remove address from addresses array if address exists
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    message: 'address removed successfully',
    data: user.addresses,
  });
});

// @doc     Get logged user addresses
// @route   GET /api/v1/addresses
// @access  Protect/user
exports.getLoggedUserAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('addresses');
  res.status(200).json({
    status: 'success',
    results: user.addresses.length,
    data: user.addresses,
  });
});
