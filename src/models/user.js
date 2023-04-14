const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const UserSchema = new Schema({
  firstName: { type: String, required: true, maxLength: 20 },
  lastName: { type: String, required: true, maxLength: 20 },
  email: { type: String, required: true, maxLength: 60 },
  password: { type: String, required: true },
  profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
});

// eslint-disable-next-line func-names
UserSchema.pre('save', async function (next) {
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

// eslint-disable-next-line func-names
UserSchema.methods.isValidPassword = async function (password) {
  const user = this;
  const isValid = await bcrypt.compare(password, user.password);
  return isValid;
};

module.exports = mongoose.model('User', UserSchema);
