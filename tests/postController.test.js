/* eslint-disable no-undef */
const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { startServer, stopServer } = require('./utils/mongoConfigTesting');
const { fakeUserData, fakeLoginData, fakePostData } = require('./fixtures');
const { user, post } = require('../src/routes');
const { Post } = require('../src/models');
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

  // populate the DB with 10 Posts
  const newPosts = [];
  for (let i = 0; i < 10; i += 1) {
    newPosts.push(new Post({ text: `this is post no ${i + 1}` }));
  }
  newPosts.forEach((newPost) => newPost.save());
});

afterAll(async () => stopServer());

describe('/Post/New Route', () => {
  test('new Post Route works', (done) => {
    request(app)
      .post('/post/new')
      .send(fakePostData)
      .set('Authorization', `Bearer ${token}`)
      .expect(201, done);
  });

  test('Invalid post text doesnt works', (done) => {
    request(app)
      .post('/post/new')
      .send({
        text: '123',
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(400, done);
  });
});

describe('/post/latest/:limit Route', () => {
  test('latest posts route works', (done) => {
    request(app)
      .get('/post/latest/10')
      .set('Authorization', `Bearer ${token}`)
      .expect((res) => {
        expect(res.body.posts.length).toBe(10);
      })
      .expect(200, done);
  });
});

describe('/post/:postid delete Route', () => {
  test('delete posts route works', (done) => {
    request(app)
      .post('/post/new')
      .send({ text: 'delete me now' })
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        request(app)
          // eslint-disable-next-line no-underscore-dangle
          .delete(`/post/${res.body.newPost._id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(204, done);
      });
  });
});
