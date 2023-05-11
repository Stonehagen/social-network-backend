const mongoose = require('mongoose');

const { Schema } = mongoose;

const ProfileSchema = new Schema({
  firstName: { type: String, required: true, maxLength: 20 },
  lastName: { type: String, required: true, maxLength: 20 },
  status: { type: String, default: 'Cornect with me!', maxLength: 40 },
  photo: { type: String, default: 'profile.jpg' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  friends: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
  friendRequestOut: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
  friendRequestIn: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
  rooms: [{ type: Schema.Types.ObjectId, ref: 'Room' }],
});

module.exports = mongoose.model('Profile', ProfileSchema);
