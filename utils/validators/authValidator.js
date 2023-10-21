const { check } = require('express-validator');
const slugify = require('slugify');
// eslint-disable-next-line import/no-extraneous-dependencies
const validationMiddleware = require('../../middlewares/validatorMiddlewar');
const User = require('../../models/userModule');

exports.signupValidator = [
  check('name')
    .notEmpty()
    .withMessage('User required')
    .isLength({ min: 3 })
    .withMessage('Too short User name')
    .custom((val, { req }) => {
      if (req.body.name) {
        req.body.slug = slugify(val);
        return true;
      }
    }),

  check('email')
    .notEmpty()
    .withMessage('email required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) {
        throw new Error('E-mail already in use');
      }
      return true;
    }),

  check('password')
    .notEmpty()
    .withMessage('password required')
    .isLength({ min: 6 })
    .withMessage('password must be at least 6 characters')
    .custom((val, { req }) => {
      if (val !== req.body.passwordConfirm) {
        throw new Error('Password confirm incorrect');
      }
      return true;
    }),
  check('passwordConfirm').notEmpty().withMessage('password confirm required'),
  validationMiddleware,
];

exports.loginValidator = [
  check('email')
    .notEmpty()
    .withMessage('email required')
    .isEmail()
    .withMessage('Invalid email address'),

  check('password')
    .notEmpty()
    .withMessage('password required')
    .isLength({ min: 6 })
    .withMessage('password must be at least 6 characters'),
  validationMiddleware,
];
