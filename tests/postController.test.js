/* eslint-disable no-undef */
const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { startServer, stopServer } = require('./utils/mongoConfigTesting');
const { fakeUserData, fakeLoginData, fakePostData } = require('./fixtures');
const { user, post } = require('../src/routes');
require('../src/config/passport');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/post', post);
app.use('/user', user);

let token = '';

beforeAll(async () => {
  await startServer();
  await request(app).post('/user/sign-up').send(fakeUserData);
  const response = await request(app).post('/user/log-in').send(fakeLoginData);
  token = response.body.token;
});
afterAll(async () => stopServer());

describe('Post new Route', () => {
  test('new Post Route works', (done) => {
    request(app)
      .post('/post/new')
      // .auth(token, { type: 'bearer' })
      .send(fakePostData)
      .set('Authorization', `Bearer ${token}`)
      .expect(201, done);
  });
});
