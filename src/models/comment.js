const mongoose = require('mongoose');

const { Schema } = mongoose;

const CommentSchema = new Schema({
  text: { type: String, required: true, maxLength: 1000 },
  timestamp: { type: Date, default: Date.now },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  author: { type: Schema.Types.ObjectId, ref: 'Profile' },
  likes: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
});

module.exports = mongoose.model('Comment', CommentSchema);
