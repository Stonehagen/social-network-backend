const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const { Post } = require('../models');

exports.createPostPost = [
  body('text', 'post text required').trim().isLength({ min: 10 }).escape(),
  // eslint-disable-next-line consistent-return
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = new Post({
      text: req.body.text,
      author: req.user.id,
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
      if (!posts) {
        return res.status(400).json({ message: 'Posts not found' });
      }
      return res.status(200).json({ posts });
    })
    .catch((err) => next(err));
};

exports.getPostGet = (req, res, next) => {
  Post.findById(req.params.postId)
    .exec()
    .then((post) => {
      if (!post) {
        return res.status(400).json({ message: 'Post not found' });
      }
      return res.status(200).json({ post });
    })
    .catch((err) => next(err));
};

exports.deletePostDelete = (req, res, next) => {
  Post.findById(req.params.postId)
    .exec()
    .then((post) => {
      if (!post) {
        return res.status(400).json({ message: 'didnt found post' });
      }
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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    Post.findById(req.params.postId)
      .exec()
      .then((foundPost) => {
        if (!foundPost) {
          return res.status(400).json({ message: 'diddnt found post' });
        }
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
        if (!updatedPost) {
          return res.status(400).json({ message: 'cant update post' });
        }
        return res.status(201).json({ message: 'update post successful' });
      })
      .catch((err) => next(err));
  },
];
