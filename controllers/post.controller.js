const Post = require('../models/post.model');
const { db } = require('../dataBase/config');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user.model');
const PostImg = require('../models/postImg.model');
const { storage } = require('../utils/firebase');
const { getDownloadURL, ref, uploadBytes } = require('firebase/storage');

exports.findAllPost = catchAsync(async (req, res, next) => {
  const posts = await Post.findAll({
    where: {
      status: 'active',
    },
    attributes: {
      exclude: ['userId', 'status'],
    },
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'profileImgUrl'],
      },
      {
        model: PostImg,
      },
    ],
    order: [['createdAt', 'DESC']],
    limit: 20,
  });

  const postPromises = posts.map(async (post) => {
    const postImgsPromises = post.postImgs.map(async (postImg) => {
      const imgRef = ref(storage, postImg.postImgUrl);
      const url = await getDownloadURL(imgRef);

      postImg.postImgUrl = url;
      return postImg;
    });

    const imgRefUser = ref(storage, post.user.profileImgUrl);
    const urlProfile = await getDownloadURL(imgRefUser);

    post.user.profileImgUrl = urlProfile;

    const postImggResolved = await Promise.all(postImgsPromises);
    post.postImg = postImggResolved;

    return posts;
  });

  const postResolved = await Promise.all(postPromises);

  return res.status(200).json({
    status: 'success',
    results: posts.length,
    posts: postResolved,
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const { title, content } = req.body;
  const { sessionUser } = req;

  const post = await Post.create({
    title,
    content,
    userId: sessionUser.id,
  });

  const postImgsPromises = req.files.map(async (file) => {
    const imgRef = ref(storage, `posts/${Date.now()}-${file.originalname}`);

    const imgUploaded = await uploadBytes(imgRef, file.buffer);

    return await PostImg.create({
      postId: post.id,
      postImgUrl: imgUploaded.metadata.fullPath,
    });
  });

  await Promise.all(postImgsPromises);

  res.status(201).json({
    status: 'success',
    message: 'The post has been created',
    post,
  });
});

exports.findMyPosts = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const query = `SELECT * FROM posts WHERE "userId" = :idusuario AND status = :status`;

  const [rows, fields] = await db.query(query, {
    replacements: {
      idusuario: sessionUser.id,
      status: 'active',
    },
  });

  res.status(200).json({
    status: 'success',
    results: fields.rowCount,
    posts: rows,
  });
});

exports.findUserPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const posts = await Post.findAll({
    where: {
      status: 'active',
      userId: id,
    },
    attributes: {
      exclude: ['userId', 'status'],
    },
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'profileImgUrl'],
      },
    ],
  });

  return res.status(200).json({
    status: 'success',
    results: posts.length,
    posts,
  });
});

exports.findOnePost = catchAsync(async (req, res, next) => {
  const { post } = req;

  const imgRefUserProfile = ref(storage, post.user.profileImgUrl);
  const urlProfileUser = await getDownloadURL(imgRefUserProfile);

  post.user.profileImgUrl = urlProfileUser;

  const postImgsPromises = post.postImgs.map(async (postImg) => {
    const imgRef = ref(storage, postImg.postImgUrl);
    const url = await getDownloadURL(imgRef);

    postImg.postImgUrl = url;
    return postImg;
  });

  const userImgsCommentPromises = post.comments.map(async (comment) => {
    const imgRef = ref(storage, comment.user.profileImgUrl);
    const url = await getDownloadURL(imgRef);

    comment.user.profileImgUrl = url;
    return comment;
  });

  const arrPromises = [...postImgsPromises, ...userImgsCommentPromises];

  await Promise.all(arrPromises);

  res.status(200).json({
    status: 'success',
    post,
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const { title, content } = req.body;
  const { post } = req;

  await post.update({ title, content });

  return res.status(200).json({
    status: 'success',
    message: 'the post has been update',
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const { post } = req;

  await post.update({ status: 'disabled' });

  return res.status(200).json({
    status: 'success',
    message: 'the post has been delete',
  });
});
