/* eslint-disable no-undef */
const { startServer, stopServer } = require('./utils/mongoConfigTesting');
const { Profile } = require('../src/models');
const { fakeProfileData } = require('./fixtures');

beforeAll(async () => startServer());
afterAll(async () => stopServer());

test('Profile Model works', async () => {
  const newProfile = new Profile(fakeProfileData);
  const savedProfile = await newProfile.save();
  console.log(savedProfile.firstName);
  expect(savedProfile).not.toBeNull();
  expect(savedProfile.firstName).toBe(fakeProfileData.firstName);
  expect(savedProfile.lastName).toBe(fakeProfileData.lastName);
});
