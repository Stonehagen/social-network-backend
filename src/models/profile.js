const mongoose = require('mongoose');

const { Schema } = mongoose;

const ProfileSchema = new Schema({
  firstName: { type: String, required: true, maxLength: 20 },
  lastName: { type: String, required: true, maxLength: 20 },
  friends: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
  friendRequestOut: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
  friendRequestIn: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
});

module.exports = mongoose.model('Profile', ProfileSchema);
