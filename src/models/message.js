const mongoose = require('mongoose');

const { Schema } = mongoose;

const MessageSchema = new Schema({
  text: { type: String, required: true, maxLength: 1000 },
  timestamp: { type: Date, default: Date.now },
  room: { type: Schema.Types.ObjectId, ref: 'Room' },
  author: { type: Schema.Types.ObjectId, ref: 'Profile' },
});

module.exports = mongoose.model('Message', MessageSchema);
