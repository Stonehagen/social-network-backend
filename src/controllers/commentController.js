/* eslint-disable no-underscore-dangle */
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { Post, Comment, Profile } = require('../models');

exports.createCommentPost = [
  body('text')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Comment must be at least 3 chars long')
    .isLength({ max: 500 })
    .withMessage('Comment cant be no longer than 500 chars')
    .escape(),
  // eslint-disable-next-line consistent-return
  async (req, res) => {
    const errors = validationResult(req);

    try {
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const profile = await Profile.findOne({ user: req.user.id });

      if (!profile) {
        return res.status(400).json({ message: 'didnt found your Profile' });
      }

      const post = await Post.findById(req.body.post);

      if (!post) {
        return res.status(400).json({ message: 'didnt found the Post' });
      }

      const comment = new Comment({
        _id: new mongoose.Types.ObjectId(),
        text: req.body.text,
        post: req.body.post,
        author: profile._id,
      });

      if (!post.comments) {
        post.comments = [comment._id];
      } else {
        post.comments.push(comment._id);
      }

      await comment.save();
      return res.status(201).json({ comment });
    } catch {
      return res.status(400).json({ message: 'Something went wrong' });
    }
  },
];

exports.likeCommentPut = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.postId);

    const profile = await Profile.findOne({ user: req.user.id });

    if (!comment) {
      return res.status(400).json({ message: 'Comment not found' });
    }

    if (comment.likes.includes(profile._id)) {
      return res.status(400).json({ message: 'You already liked the Comment' });
    }

    if (!comment.likes) {
      comment.likes = [profile._id];
    } else {
      comment.likes.push(profile._id);
    }

    await comment.save();
    return res.status(201).json({ message: 'update Comment successful' });
  } catch {
    return res.status(400).json({ message: 'Cant update Comment' });
  }
};
