const Comment = require('../models/comment.model');
const Post = require('../models/post.model');

const catchAsync = require('../utils/catchAsync');

exports.findAllComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findAll({
    where: {
      status: 'active',
    },
  });

  res.status(200).json({
    status: 'success',
    results: comment.length,
    comment,
  });
});

exports.createComment = catchAsync(async (req, res, next) => {
  const { Text } = req.body;
  const { postId } = req.params;
  const { sessionUser } = req;

  const comment = await Comment.create({
    Text,
    postId,
    userId: sessionUser.id,
  });
  res.status(201).json({
    status: 'success',
    message: 'The comment has been created',
    comment,
  });
});

exports.findCommentById = catchAsync(async (req, res, next) => {
  const { comment } = req;

  res.status(200).json({
    status: 'success',
    comment,
  });
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const { Text } = req.body;
  const { comment } = req;

  await comment.update({ Text });

  return res.status(200).json({
    status: 'success',
    message: 'the comment has been update',
    comment,
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const { comment } = req;

  await comment.update({ status: 'disabled' });

  return res.status(200).json({
    status: 'success',
    message: 'the comment has been deleted',
    comment,
  });
});
