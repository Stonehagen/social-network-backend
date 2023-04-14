/* eslint-disable no-undef */
const { startServer, stopServer } = require('./utils/mongoConfigTesting');
const { Post } = require('../src/models');
const { fakePostData } = require('./fixtures');

beforeAll(async () => startServer());
afterAll(async () => stopServer());

test('Profile Model works', async () => {
  const newPost = new Post(fakePostData);
  const savedPost = await newPost.save();
  expect(savedPost).not.toBeNull();
  expect(savedPost.text).toBe(fakePostData.text);
});
