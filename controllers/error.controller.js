const AppError = require('../utils/appError');

const handleCastError22P02 = () =>
  new AppError(`some type of data send does'nt match was expected`, 400);

const handleJWTExpiredError = () =>
  new AppError('Your tonek has expired! Please Login again', 401);

const handleJWTError = () =>
  new AppError('Invalid Token. Please login again!', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('error 🧨', err);
    res.status(500).json({
      status: 'fail',
      message: 'Internal server error',
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }
  if (process.env.NODE_ENV === 'production') {
    let error = err;

    if (error.parent?.code === '22P02') error = handleCastError22P02();

    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.name === 'JsonWebTokenError') error = handleJWTError();

    sendErrorProd(error, res);
  }
};

module.exports = globalErrorHandler;
