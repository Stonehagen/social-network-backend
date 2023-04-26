const mongoose = require('mongoose');

const { Schema } = mongoose;

const PostSchema = new Schema({
  text: { type: String, required: true, maxLength: 1000 },
  public: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  author: { type: Schema.Types.ObjectId, ref: 'Profile' },
  likes: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
});

module.exports = mongoose.model('Post', PostSchema);
