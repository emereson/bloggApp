const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const commentMiddleware = require('../middlewares/comment.middleware');
const validationMiddleware = require('../middlewares/validation.middleware');

const CommentController = require('../controllers/comment.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', CommentController.findAllComment);

router.post('/:postId', CommentController.createComment);

router
  .use('/:id', commentMiddleware.commentExist)
  .route('/:id')
  .get(CommentController.findCommentById)
  .patch(
    validationMiddleware.validContenComment,
    CommentController.updateComment
  )
  .delete(
    validationMiddleware.validContenComment,
    CommentController.deleteComment
  );

module.exports = router;
