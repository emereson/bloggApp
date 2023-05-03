const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcryptjs');
const generateJwt = require('../utils/jwt');
const AppError = require('../utils/appError');
const { ref, uploadBytes } = require('firebase/storage');
const { storage } = require('../utils/firebase');

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const imgRef = ref(storage, `users/${Date.now()}-${req.file.originalname}`);
  const imgUploaded = await uploadBytes(imgRef, req.file.buffer);

  const salt = await bcrypt.genSalt(10);
  const ecryptedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.toLowerCase(),
    email: email.toLowerCase(),
    password: ecryptedPassword,
    role,
    profileImgUrl: imgUploaded.metadata.fullPath,
  });

  const token = await generateJwt(user.id);

  res.status(201).json({
    status: 'success',
    message: 'the user has ben created successfully!',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImgUrl: user.profileImgUrl,
      role: user.role,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    where: {
      email,
      status: 'active',
    },
  });

  if (!user) {
    return next(new AppError('the user could not be found', 404));
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = await generateJwt(user.id);

  res.status(200).json({
    status: 'success',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImgUrl: user.profileImgUrl,
      role: user.role,
    },
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { currentPassword, newPassword } = req.body;

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return next(new AppError('Incorrect password', 401));
  }

  const salt = await bcrypt.genSalt(10);
  const encriptedPassword = await bcrypt.hash(newPassword, salt);

  await user.update({
    password: encriptedPassword,
    passwordChangedAt: new Date(),
  });

  return res.status(200).json({
    status: 'success',
    message: 'The user password was updated successfully!',
  });
});

exports.renew = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const token = await generateJwt(sessionUser.id);

  return res.status(200).json({
    status: 'success',
    token,
    user: {
      id: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
      role: sessionUser.role,
    },
  });
});
