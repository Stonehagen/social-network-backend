const mongoose = require('mongoose');

const { Schema } = mongoose;

const RoomSchema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
  timestamp: { type: Date, default: Date.now },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
});

module.exports = mongoose.model('Room', RoomSchema);
