const express = require('express');
const { upload } = require('../utils/multer');

// middlewares
const validations = require('../middlewares/validation.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

// controllers
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post(
  '/signup',
  upload.single('profileImgUrl'),
  validations.createUserValidation,
  authController.signup
);

router.post('/login', validations.loginUserValidation, authController.login);

router.use(authMiddleware.protect);

router.get('/renew', authController.renew);

module.exports = router;
