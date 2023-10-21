const express = require('express');
const authService = require('../services/authService');
const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
} = require('../services/addressService');

const {
  createAddressValidator,
} = require('../utils/validators/addressValidator');

const router = express.Router();
router.use(authService.protect, authService.allowedTo('user'));

router
  .route('/')
  .post(createAddressValidator, addAddress)
  .get(getLoggedUserAddresses);
router.delete('/:addressId', removeAddress);

module.exports = router;
