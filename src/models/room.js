const mongoose = require('mongoose');

const { Schema } = mongoose;

const RoomSchema = new Schema({
  name: { type: String, default: null, maxLength: 30 },
  users: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
});

module.exports = mongoose.model('Room', RoomSchema);
