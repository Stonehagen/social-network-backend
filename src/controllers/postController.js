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

      const post = new Post({
        text: req.body.text,
        author: profile._id,
        public: req.body.public,
      });

      await post.save();
      return res.status(201).json({ post });
    } catch {
      return res.status(400).json({ message: 'Something went wrong' });
    }
  },
];

exports.getPostLikesGet = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate('likes');

    if (!post) {
      return res.status(400).json({ message: 'Post not found' });
    }

    return res.status(200).json({ likes: post.likes });
  } catch {
    return res.status(400).json({ message: 'Something went wrong' });
  }
};

exports.getPostCommentsGet = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate('comments');

    if (!post) {
      return res.status(400).json({ message: 'Post not found' });
    }

    return res.status(200).json({ likes: post.comments });
  } catch {
    return res.status(400).json({ message: 'Something went wrong' });
  }
};

exports.getLatestPostsGet = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const posts = await Post.find({
      $or: [{ public: true }, { author: { $in: profile.friends } }],
    })
      .sort({ timestamp: -1 })
      .limit(+req.params.limit)
      .populate('author');

    if (!posts) {
      return res.status(400).json({ message: 'no Posts found' });
    }
    return res.status(200).json({ posts });
  } catch {
    return res.status(400).json({ message: 'Something went wrong' });
  }
};

exports.getUserPostsGet = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.id })
      .sort({ timestamp: -1 })
      .populate('author');

    if (!posts) {
      return res.status(400).json({ message: 'no Posts found' });
    }
    return res.status(200).json({ posts });
  } catch {
    return res.status(400).json({ message: 'Something went wrong' });
  }
};

exports.getPostGet = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(400).json({ message: 'Post not found' });
    }

    return res.status(200).json({ post });
  } catch {
    return res.status(400).json({ message: 'Something went wrong' });
  }
};

exports.deletePostDelete = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate('author');

    if (!post) {
      return res.status(400).json({ message: 'Post not found' });
    }

    if (post.author.user.toString() !== req.user.id.toString()) {
      return res.status(400).json({ message: 'not author of the post' });
    }
    await Post.findByIdAndRemove(req.params.postId);

    return res.status(204).json({ message: 'delete post successful' });
  } catch {
    return res.status(400).json({ message: 'cant delete post' });
  }
};

exports.likePostPut = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    const profile = await Profile.findOne({ user: req.user.id });

    if (!post) {
      return res.status(400).json({ message: 'Post not found' });
    }

    if (post.likes.includes(profile._id)) {
      return res.status(400).json({ message: 'You already liked the Post' });
    }

    if (!post.likes) {
      post.likes = [profile._id];
    } else {
      post.likes.push(profile._id);
    }

    await post.save();
    return res.status(201).json({ message: 'update post successful' });
  } catch {
    return res.status(400).json({ message: 'Cant update Post' });
  }
};

exports.unlikePostPut = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    const profile = await Profile.findOne({ user: req.user.id });

    if (!post) {
      return res.status(400).json({ message: 'Post not found' });
    }

    if (!post.likes || !post.likes.includes(profile._id)) {
      return res.status(400).json({ message: 'You diddnt liked the Post' });
    }

    post.likes = post.likes.filter(
      (like) => like.toString() !== profile._id.toString(),
    );

    await post.save();
    return res.status(201).json({ message: 'update post successful' });
  } catch {
    return res.status(400).json({ message: 'Cant update Post' });
  }
};

exports.editPostPut = [
  body('text', 'post text required').trim().isLength({ min: 5 }).escape(),
  // eslint-disable-next-line consistent-return
  async (req, res) => {
    const errors = validationResult(req);

    try {
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }
      const post = await Post.findById(req.params.postId).populate('author');

      if (!post) {
        return res.status(400).json({ message: 'Post not found' });
      }

      if (post.author.user.toString() !== req.user.id.toString()) {
        return res.status(400).json({ message: 'not author of the post' });
      }

      post.text = req.body.text;

      await post.save();

      return res.status(201).json({ message: 'update post successful' });
    } catch {
      return res.status(400).json({ message: 'Cant update Post' });
    }
  },
];
