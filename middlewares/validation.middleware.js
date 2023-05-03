const { body, validationResult } = require('express-validator');

const validateFields = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.mapped(),
    });
  }

  next();
};

exports.createUserValidation = [
  body('name').notEmpty().withMessage('Name cannot be empty'),
  body('email')
    .notEmpty()
    .withMessage('email cannot be empty')
    .isEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .notEmpty()
    .withMessage('password cannot be empty')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  validateFields,
];

exports.updateUserValidation = [
  body('name').notEmpty().withMessage('Name cannot be empty'),
  body('email')
    .notEmpty()
    .withMessage('email cannot be empty')
    .isEmail()
    .withMessage('Must be a valid email'),
  validateFields,
];

exports.loginUserValidation = [
  body('email')
    .notEmpty()
    .withMessage('email cannot be empty')
    .isEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .notEmpty()
    .withMessage('password cannot be empty')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  validateFields,
];

exports.updatePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('password cannot be empty')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('newPassword')
    .notEmpty()
    .withMessage('password cannot be empty')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  validateFields,
];

exports.createPostValidation = [
  body('title').notEmpty().withMessage('the title is requires'),
  body('content').notEmpty().withMessage('the content is requires'),
  validateFields,
];

exports.validContenComment = [
  body('Text').notEmpty().withMessage('the Text is requires'),
  validateFields,
];
