const { body } = require('express-validator');
const validationMiddleware = require('../../middlewares/validatorMiddlewar');
const User = require('../../models/userModule');

exports.createAddressValidator = [
  body('alias')
    .notEmpty()
    .withMessage('This field is required')
    .custom(async (val) => {
      const user = await User.findOne({ alias: val });
      if (user) {
        const hasAddressWithAlias = user.addresses.some(
          (el) => el.alias === val,
        );
        if (hasAddressWithAlias) {
          throw new Error(
            `You are already have an address with this name (${val})`,
          );
        }
      }
      return true;
    }),
  body('details').notEmpty().withMessage('This field is required'),

  body('phone')
    .notEmpty()
    .withMessage('This field is required')
    .isMobilePhone('ar-SA')
    .withMessage('Invalid phone number only accept Saudi Arabian phone number'),

  body('city').notEmpty().withMessage('This field is required'),

  body('postalCode')
    .notEmpty()
    .withMessage('This field is required')
    .isPostalCode('SA')
    .withMessage('Invalid postal code, only accept Saudi Arabian postal codes'),
  validationMiddleware,
];
