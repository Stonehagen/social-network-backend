const mongoose = require('mongoose');

exports.fakeUserData = {
  _id: new mongoose.mongo.ObjectId(),
  firstName: 'Tobias',
  lastName: 'Stonehagen',
  email: 'fake@user.com',
  password: '12345678',
};

exports.fakeUserData2 = {
  _id: new mongoose.mongo.ObjectId(),
  firstName: 'Horst',
  lastName: 'Mayer',
  email: 'hoho@user.com',
  password: '12345678',
};
