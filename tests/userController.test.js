/* eslint-disable no-undef */
const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { startServer, stopServer } = require('./utils/mongoConfigTesting');
const { fakeUserData, fakeLoginData } = require('./fixtures');
const { user } = require('../src/routes');
require('../src/config/passport');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/user', user);

beforeAll(async () => startServer());
afterAll(async () => stopServer());

test('User Signup Route works', (done) => {
  request(app).post('/user/sign-up').send(fakeUserData).expect(201, done);
});

test('User LogIn Route works', (done) => {
  request(app)
    .post('/user/sign-up')
    .send(fakeUserData)
    .then(() => {
      request(app)
        .post('/user/log-in')
        .send(fakeLoginData)
        .expect(200, done)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('user');
        });
    });
});
