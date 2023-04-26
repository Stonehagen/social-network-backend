const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const { checkFound } = require('../methods/checkFound');
const { checkErrors } = require('../methods/checkErrors');
const { Post } = require('../models');

exports.createPostPost = [
  body('text')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Post must be at least 5 chars long')
    .isLength({ max: 500 })
    .withMessage('Post cant be no longer than 500 chars')
    .escape(),
  // eslint-disable-next-line consistent-return
  (req, res, next) => {
    checkErrors(res, validationResult(req), 400);

    const post = new Post({
      text: req.body.text,
      author: req.user.id,
      public: req.user.public,
    });

    post
      .save()
      .then((newPost) => res.status(201).json({ newPost }))
      .catch((err) => next(err));
  },
];

exports.getLatestPostsGet = (req, res, next) => {
  Post.find()
    .sort({ timestamp: -1 })
    .limit(+req.params.limit)
    .exec()
    .then((posts) => {
      checkFound(res, posts, 400, 'Posts not found');
      return res.status(200).json({ posts });
    })
    .catch((err) => next(err));
};

exports.getPostGet = (req, res, next) => {
  Post.findById(req.params.postId)
    .exec()
    .then((post) => {
      checkFound(res, post, 400, 'Post not found');
      return res.status(200).json({ post });
    })
    .catch((err) => next(err));
};

exports.deletePostDelete = (req, res, next) => {
  Post.findById(req.params.postId)
    .exec()
    .then((post) => {
      checkFound(res, post, 400, 'Post not found');

      const userId = new mongoose.mongo.ObjectId(req.user.id);
      if (post.author.toString() !== userId.toString()) {
        return res.status(400).json({ message: 'not author of the post' });
      }
      return Post.findByIdAndRemove(req.params.postId);
    })
    .then((deletedPost) => {
      if (!deletedPost) {
        return res.status(400).json({ message: 'cant delete post' });
      }
      return res.status(204).json({ message: 'delete post successful' });
    })
    .catch((err) => next(err));
};

exports.editPostPut = [
  body('text', 'post text required').trim().isLength({ min: 10 }).escape(),
  // eslint-disable-next-line consistent-return
  (req, res, next) => {
    checkErrors(res, validationResult(req), 400);

    Post.findById(req.params.postId)
      .exec()
      .then((foundPost) => {
        checkFound(res, foundPost, 400, 'Post not found');

        const post = new Post({
          _id: new mongoose.mongo.ObjectId(req.params.postId),
          text: req.body.text,
          author: req.user.id,
          likes: foundPost.likes,
        });

        const userId = new mongoose.mongo.ObjectId(req.user.id);
        if (post.author.toString() !== userId.toString()) {
          return res.status(400).json({ message: 'not author of the post' });
        }
        return Post.findByIdAndUpdate(req.params.postId, post);
      })
      .then((updatedPost) => {
        checkFound(res, updatedPost, 400, 'cant update post');
        return res.status(201).json({ message: 'update post successful' });
      })
      .catch((err) => next(err));
  },
];
