const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const xss = require('xss-clean');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/error.controller');

const userRouter = require('./routes/user.routes');
const postRouter = require('./routes/post.routes');
const authRouter = require('./routes/auth.routes');
const commentRouter = require('./routes/comment.routes');

const app = express();
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this Ip, please try again in an hour!',
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(xss());
app.use(hpp());

app.use('/api/v1', limiter);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/post', postRouter);
app.use('/api/v1/comment', commentRouter);

app.all('*', (req, res, next) => {
  return next(
    new AppError(`Can't find ${req.originalUrl} on this seerver! 💀`, 404)
  );
});

app.use(globalErrorHandler);

module.exports = app;
