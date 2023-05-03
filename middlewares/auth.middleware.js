const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user.model');

exports.protect = catchAsync(async (req, res, next) => {
  //1. extraer el token
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  //2. validar si existe el token
  if (!token) {
    return next(
      new AppError('You are not logged in!, Please log in to get access', 401)
    );
  }

  //3. decodificar el jwt
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.SECRET_JWT_SEED
  );

  //4. buscar el usuario y validar si existe
  const user = await User.findOne({
    where: {
      id: decoded.id,

      status: 'active',
    },
  });

  console.log(user);

  if (!user) {
    return next(
      new AppError('The owner of this token it not longer available', 401)
    );
  }

  if (user.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      user.passwordChangedAt.getTime() / 1000,
      10
    );

    if (decoded.iat < changedTimeStamp) {
      return next(
        new AppError(
          'User recently changes password! , please login again',
          401
        )
      );
    }
  }

  req.sessionUser = user;
  next();
});

exports.protectAccountOwner = catchAsync(async (req, res, next) => {
  //validar el usuario dueño del id de la req.params, y validar el usuario en session
  const { user, sessionUser } = req;

  if (user.id !== sessionUser.id) {
    return next(new AppError('you do not own this account.', 401));
  }

  next();
});

exports.restricTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.sessionUser.role)) {
      return next(
        new AppError('You do not have permission to perform this action!', 403)
      );
    }
    next();
  };
};
