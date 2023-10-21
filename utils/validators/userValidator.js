const { check, body } = require('express-validator');
const slugify = require('slugify');
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcryptjs');
const validationMiddleware = require('../../middlewares/validatorMiddlewar');
const User = require('../../models/userModule');

exports.createUserValidator = [
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

  check('phone')
    .optional()
    .isMobilePhone('ar-SA')
    .withMessage('Invalid phone number only accept SA phone number'),

  check('profileImage').optional(),

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

  check('role').optional(),

  validationMiddleware,
];

exports.changeUserPasswordValidator = [
  check('_id').isMongoId().withMessage('Invalid User id format'),
  body('currentPassword').notEmpty().withMessage('enter current password'),

  body('passwordConfirm').notEmpty().withMessage('enter password confirm'),

  body('password')
    .notEmpty()
    .withMessage('enter the new password')
    .custom(async (val, { req }) => {
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error('No user for this id');
      }
      // verify current password
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password,
      );
      if (!isCorrectPassword) {
        throw new Error('Incorrect current password');
      }

      // verify password confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error('Password confirm incorrect');
      }
      return true;
    }),
  validationMiddleware,
];

exports.getUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  validationMiddleware,
];

exports.updateUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  body('name')
    .optional()
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

  check('phone')
    .optional()
    .isMobilePhone('ar-SA')
    .withMessage('Invalid phone number only accept SA phone number'),

  check('profileImage').optional(),

  check('role').optional(),
  validationMiddleware,
];

exports.deleteUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  validationMiddleware,
];

exports.updateLoggedUserValidator = [
  body('name')
    .optional()
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

  check('phone')
    .optional()
    .isMobilePhone('ar-SA')
    .withMessage('Invalid phone number only accept SA phone number'),
  validationMiddleware,
];
