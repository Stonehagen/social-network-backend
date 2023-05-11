const mongoose = require('mongoose');

const { Schema } = mongoose;

const RoomSchema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
});

module.exports = mongoose.model('Room', RoomSchema);
