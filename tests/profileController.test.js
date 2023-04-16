/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { startServer, stopServer } = require('./utils/mongoConfigTesting');
const { fakeUserData, fakeUserData2, fakeLoginData } = require('./fixtures');
const { user, profile } = require('../src/routes');
const { Profile } = require('../src/models');
require('../src/config/passport');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/profile', profile);
app.use('/user', user);

let token = '';
let friendProfile;
let userProfile;

const addFriendRequest = async (friend, requester) => {
  requester.friendRequestOut.push(friend._id);
  friend.friendRequestIn.push(requester._id);
  await requester.save();
  await friend.save();
};

beforeAll(async () => {
  await startServer();
  await request(app).post('/user/sign-up').send(fakeUserData);
  await request(app).post('/user/sign-up').send(fakeUserData2);
  const response = await request(app).post('/user/log-in').send(fakeLoginData);
  token = response.body.token;
  friendProfile = await Profile.findOne({
    firstName: fakeUserData2.firstName,
  }).exec();
  userProfile = await Profile.findOne({
    firstName: fakeUserData.firstName,
  }).exec();
  await addFriendRequest(userProfile, friendProfile);
});

afterAll(async () => stopServer());

describe('/Profile/friendRequestPost', () => {
  test('new Friend request Route works', (done) => {
    request(app)
      .put('/profile/friendRequestPost')
      .send({ requestedFriend: friendProfile._id.toString() })
      .set('Authorization', `Bearer ${token}`)
      .expect(201, done);
  });

  test('double Friend request dont works', (done) => {
    request(app)
      .put('/profile/friendRequestPost')
      .send({ requestedFriend: friendProfile._id.toString() })
      .set('Authorization', `Bearer ${token}`)
      .expect(400, done);
  });
});

describe('/Profile/acceptFriendrequest', () => {
  test('accept Friend request Route works', (done) => {
    request(app)
      .put('/profile/acceptFriendrequest')
      .send({ acceptedFriend: friendProfile._id.toString() })
      .set('Authorization', `Bearer ${token}`)
      .expect(201, done);
  });
});
