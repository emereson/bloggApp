const express = require('express');

//controllers
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

//middlewares
const userMiddleware = require('../middlewares/user.middleware');
const validationMiddleware = require('../middlewares/validation.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', userController.findAll);

router
  .route('/:id')
  .get(userMiddleware.validIfExistUser, userController.findOne)
  .patch(
    userMiddleware.validIfExistUser,
    authMiddleware.protectAccountOwner,
    validationMiddleware.updateUserValidation,
    userController.update
  )
  .delete(
    userMiddleware.validIfExistUser,
    authMiddleware.protectAccountOwner,
    authMiddleware.restricTo('admin'),
    userController.delete
  );

router.patch(
  '/password/:id',
  validationMiddleware.updatePasswordValidation,
  userMiddleware.validIfExistUser,
  authMiddleware.protectAccountOwner,
  authController.updatePassword
);

module.exports = router;
