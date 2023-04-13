/* eslint-disable no-undef */
const { startServer, stopServer } = require('./utils/mongoConfigTesting');
const { User } = require('../src/models');
const { fakeUserData } = require('./fixtures');

beforeAll(async () => startServer());
afterAll(async () => stopServer());

test('User Model works', async () => {
  const newUser = new User(fakeUserData);
  const savedUser = await newUser.save();
  expect(savedUser).not.toBeNull();
  expect(savedUser.firstName).toBe(fakeUserData.firstName);
  expect(savedUser.lastName).toBe(fakeUserData.lastName);
  expect(savedUser.email).toBe(fakeUserData.email);
  expect(savedUser.password).not.toBe(fakeUserData.password);
});
