/* eslint-disable no-underscore-dangle */
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const { Profile } = require('../models');

exports.friendRequestPut = [
  body('requestedFriend', 'who?').trim().notEmpty().escape(),
  // eslint-disable-next-line consistent-return
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reqFriendId = new mongoose.mongo.ObjectId(req.body.requestedFriend);
    let userProfile;

    Profile.findOne({ user: req.user.id })
      .then((foundUserProfile) => {
        if (!foundUserProfile) {
          return res.status(404).json({ message: 'didnt found your Profile' });
        }
        userProfile = foundUserProfile;

        return Profile.findById(req.body.requestedFriend);
      })
      .then((foundFriendProfile) => {
        if (!foundFriendProfile) {
          return res
            .status(404)
            .json({ message: 'didnt found Friend Profile' });
        }
        if (foundFriendProfile.friendRequestIn.includes(userProfile._id)) {
          return res
            .status(400)
            .json({ message: 'you already made an request' });
        }
        foundFriendProfile.friendRequestIn.push(userProfile._id);

        return foundFriendProfile.save();
      })
      .then(() => {
        if (userProfile.friendRequestOut.includes(reqFriendId)) {
          return res
            .status(400)
            .json({ message: 'you already made an request' });
        }
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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const reqFriendId = new mongoose.mongo.ObjectId(req.body.acceptedFriend);
    let userProfile;

    Profile.findOne({ user: req.user.id })
      .then((foundUserProfile) => {
        if (!foundUserProfile) {
          return res.status(404).json({ message: 'didnt found your Profile' });
        }
        userProfile = foundUserProfile;

        return Profile.findById(req.body.acceptedFriend);
      })
      // Remove friendrequest
      .then((foundFriendProfile) => {
        if (!foundFriendProfile) {
          return res
            .status(404)
            .json({ message: 'didnt found Friend Profile' });
        }
        if (
          // eslint-disable-next-line operator-linebreak
          !foundFriendProfile.friendRequestOut.includes(userProfile._id) ||
          !userProfile.friendRequestIn.includes(foundFriendProfile._id)
        ) {
          return res
            .status(400)
            .json({ message: 'you got no reqest to accept' });
        }

        // eslint-disable-next-line no-param-reassign, operator-linebreak
        foundFriendProfile.friendRequestOut =
          foundFriendProfile.friendRequestOut.filter(
            (id) => id !== userProfile._id,
          );
        // eslint-disable-next-line operator-linebreak, no-param-reassign
        foundFriendProfile.friendRequestIn =
          foundFriendProfile.friendRequestIn.filter(
            (id) => id !== userProfile._id,
          );
        foundFriendProfile.friends.push(userProfile._id);

        return foundFriendProfile.save();
      })
      .then(() => {
        if (userProfile.friends.includes(reqFriendId)) {
          return res
            .status(400)
            .json({ message: 'you already are friends with him' });
        }

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
