/* eslint-disable no-underscore-dangle */
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const { upload } = require('../config/pictureStorage');
const { checkFound } = require('../methods/checkFound');
const { checkErrors } = require('../methods/checkErrors');
const {
  checkDoubleRequest,
  checkIfFriends,
  checkIfRequestIsMade,
} = require('../methods/profileRouteCheck');
const { Profile } = require('../models');

exports.profileGet = (req, res, next) => {
  Profile.findOne({ user: req.user.id })
    .exec()
    .then((profile) => {
      if (!profile) {
        return res.status(404).json({ message: 'no profile found' });
      }
      return res.status(200).json({ profile });
    })
    .catch((err) => next(err));
};

exports.friendRequestPut = [
  body('requestedFriend', 'who?').trim().notEmpty().escape(),
  // eslint-disable-next-line consistent-return
  (req, res, next) => {
    checkErrors(res, validationResult(req), 400);

    const reqFriendId = new mongoose.mongo.ObjectId(req.body.requestedFriend);
    const userProfile = Profile.findOne({ user: req.user.id })
      .then((foundUserProfile) => {
        checkFound(res, foundUserProfile, 404, 'didnt found your Profile');
        return foundUserProfile;
      })
      .catch((err) => next(err));

    Profile.findById(req.body.requestedFriend)
      .then((foundFriend) => {
        checkFound(res, foundFriend, 404, 'didnt found Friend Profile');
        checkDoubleRequest(res, foundFriend.friendRequestIn, userProfile._id);

        foundFriend.friendRequestIn.push(userProfile._id);
        return foundFriend.save();
      })
      .then(() => {
        checkDoubleRequest(res, userProfile.friendRequestOut, reqFriendId);

        userProfile.friendRequestOut.push(reqFriendId);
        return userProfile.save();
      })
      .then(() => res.status(201).json({ message: 'friend request made' }))
      .catch((err) => next(err));
  },
];

exports.acceptFriendrequestPut = [
  body('acceptedFriend', 'who?').trim().notEmpty().escape(),
  // eslint-disable-next-line consistent-return
  (req, res, next) => {
    checkErrors(res, validationResult(req), 400);

    const reqFriendId = new mongoose.mongo.ObjectId(req.body.acceptedFriend);
    let userProfile;

    Profile.findOne({ user: req.user.id })
      .then((foundUserProfile) => {
        checkFound(res, foundUserProfile, 404, 'didnt found your Profile');
        userProfile = foundUserProfile;

        return Profile.findById(req.body.acceptedFriend);
      })
      .then((foundFriend) => {
        checkFound(res, foundFriend, 404, 'didnt found Friend Profile');
        checkIfRequestIsMade(res, foundFriend, userProfile);

        // eslint-disable-next-line no-param-reassign, operator-linebreak
        foundFriend.friendRequestOut = foundFriend.friendRequestOut.filter(
          (id) => id !== userProfile._id,
        );
        // eslint-disable-next-line operator-linebreak, no-param-reassign
        foundFriend.friendRequestIn = foundFriend.friendRequestIn.filter(
          (id) => id !== userProfile._id,
        );

        foundFriend.friends.push(userProfile._id);
        return foundFriend.save();
      })
      .then(() => {
        checkIfFriends(res, userProfile.friends, reqFriendId);

        userProfile.friendRequestOut = userProfile.friendRequestOut.filter(
          (id) => id !== userProfile._id,
        );
        userProfile.friendRequestIn = userProfile.friendRequestIn.filter(
          (id) => id !== userProfile._id,
        );

        userProfile.friends.push(reqFriendId);
        return userProfile.save();
      })
      .then(() => res.status(201).json({ message: 'friend request made' }))
      .catch((err) => next(err));
  },
];

exports.uploadPicturePut = [
  upload.single('photo'),
  (req, res, next) => {
    Profile.findOne({ user: req.user.id })
      .then((foundUserProfile) => {
        checkFound(res, foundUserProfile, 404, 'didnt found your Profile');

        // eslint-disable-next-line no-param-reassign
        foundUserProfile.photo = req.file.filename;
        return foundUserProfile.save();
      })
      .then(() => res.status(201).json({ message: 'photo added' }))
      .catch((err) => next(err));
  },
];
