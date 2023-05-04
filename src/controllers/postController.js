/* eslint-disable no-underscore-dangle */
const { body, validationResult } = require('express-validator');

const { Post, Profile } = require('../models');

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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    Profile.findOne({ user: req.user.id })
      .exec()
      .then((profile) => {
        if (!profile) {
          return res.status(400).json({ message: 'didnt found your Profile' });
        }
        const post = new Post({
          text: req.body.text,
          author: profile._id,
          public: req.body.public,
        });
        return post.save();
      })
      .then((newPost) => res.status(201).json({ newPost }))
      .catch((err) => next(err));
  },
];

exports.getLatestPostsGet = (req, res, next) => {
  Post.find()
    .sort({ timestamp: -1 })
    .limit(+req.params.limit)
    .populate('author')
    .exec()
    .then((posts) => {
      if (!posts) {
        return res.status(400).json({ message: 'no Posts found' });
      }
      return res.status(200).json({ posts });
    })
    .catch((err) => next(err));
};

exports.getUserPostsGet = (req, res, next) => {
  Post.find({ author: req.params.id })
    .sort({ timestamp: -1 })
    .populate('author')
    .exec()
    .then((posts) => {
      if (!posts) {
        return res.status(400).json({ message: 'no Posts found' });
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
    .populate('author')
    .exec()
    .then((post) => {
      if (!post) {
        return res.status(400).json({ message: 'Post not found' });
      }

      if (post.author.user.toString() !== req.user.id.toString()) {
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
  body('text', 'post text required').trim().isLength({ min: 5 }).escape(),
  // eslint-disable-next-line consistent-return
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    Post.findById(req.params.postId)
      .populate('author')
      .exec()
      .then((foundPost) => {
        if (!foundPost) {
          return res.status(400).json({ message: 'Post not found' });
        }

        if (foundPost.author.user.toString() !== req.user.id.toString()) {
          return res.status(400).json({ message: 'not author of the post' });
        }

        // eslint-disable-next-line no-param-reassign
        foundPost.text = req.body.text;

        return foundPost.save();
      })
      .then((updatedPost) => {
        if (!updatedPost) {
          return res.status(400).json({ message: 'Cant update Post' });
        }
        return res.status(201).json({ message: 'update post successful' });
      })
      .catch((err) => next(err));
  },
];
