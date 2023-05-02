/* eslint-disable no-underscore-dangle */
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { unlink } = require('fs');

const { upload } = require('../config/pictureStorage');
const { Profile } = require('../models');
const { Console } = require('console');

exports.profileGet = (req, res, next) => {
  Profile.findOne({ user: req.user.id })
    .exec()
    .then((profile) => {
      if (!profile) {
        return res.status(400).json({ message: 'didnt found your Profile' });
      }
      return res.status(200).json({ profile });
    })
    .catch((err) => next(err));
};

exports.latestProfileGet = (req, res, next) => {
  Profile.find()
    .limit(5)
    .exec()
    .then((profiles) => {
      if (!profiles) {
        return res.status(400).json({ message: 'didnt found any Profiles' });
      }
      return res.status(200).json({ profiles });
    })
    .catch((err) => next(err));
};

exports.profilePut = [
  body('firstName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First Name be at least 2 chars long')
    .isLength({ max: 20 })
    .withMessage('First Name cant be longer than 20 chars')
    .escape(),
  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last Name be at least 2 chars long')
    .isLength({ max: 20 })
    .withMessage('Last Name cant be longer than 20 chars')
    .escape(),
  body('status')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Your status is to short.')
    .isLength({ max: 50 })
    .withMessage('Your status is to long.')
    .escape(),
  // eslint-disable-next-line consistent-return
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    Profile.findOne({ user: req.user.id })
      .then((foundUserProfile) => {
        if (!foundUserProfile) {
          return res.status(400).json({ message: 'didnt found your Profile' });
        }
        // eslint-disable-next-line no-param-reassign
        foundUserProfile.status = req.body.status;
        // eslint-disable-next-line no-param-reassign
        foundUserProfile.firstName = req.body.firstName;
        // eslint-disable-next-line no-param-reassign
        foundUserProfile.lastName = req.body.lastName;
        return foundUserProfile.save();
      })
      .then(() => res.status(201).json({ message: 'profile changed' }))
      .catch((err) => next(err));
  },
];

exports.friendRequestPut = [
  body('requestedFriend', 'who?').trim().notEmpty().escape(),
  // eslint-disable-next-line consistent-return
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const reqFriendId = new mongoose.mongo.ObjectId(req.body.requestedFriend);
    const userProfile = await Profile.findOne({ user: req.user.id })
      .then((foundUserProfile) => {
        if (!foundUserProfile) {
          return res.status(400).json({ message: 'didnt found your Profile' });
        }
        return foundUserProfile;
      })
      .catch((err) => next(err));

    Profile.findById(req.body.requestedFriend)
      .then((foundFriend) => {
        if (!foundFriend) {
          return res
            .status(400)
            .json({ message: 'didnt found your Friends Profile' });
        }

        if (foundFriend.friendRequestIn.includes(userProfile._id)) {
          return res
            .status(400)
            .json({ message: 'you already made this friend request' });
        }

        foundFriend.friendRequestIn.push(userProfile._id);

        return foundFriend.save();
      })
      .then(() => {
        if (userProfile.friendRequestOut.includes(reqFriendId)) {
          return res
            .status(400)
            .json({ message: 'you already made this friend request' });
        }

        if (!userProfile.friendRequestOut) {
          userProfile.friendRequestOut = [reqFriendId];
        } else {
          userProfile.friendRequestOut.push(reqFriendId);
        }

        return userProfile.save();
      })
      .then(() => res.status(201).json({ message: 'friend request made' }))
      .catch((err) => next(err));
  },
];

exports.friendRequestCancelPut = [
  body('requestedFriend', 'who?').trim().notEmpty().escape(),
  // eslint-disable-next-line consistent-return
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const reqFriendId = new mongoose.mongo.ObjectId(req.body.requestedFriend);
    const userProfile = await Profile.findOne({ user: req.user.id })
      .then((foundUserProfile) => {
        if (!foundUserProfile) {
          return res.status(400).json({ message: 'didnt found your Profile' });
        }
        return foundUserProfile;
      })
      .catch((err) => next(err));

    Profile.findById(req.body.requestedFriend)
      .then((foundFriend) => {
        if (!foundFriend) {
          return res
            .status(400)
            .json({ message: 'didnt found your Friends Profile' });
        }

        // eslint-disable-next-line no-param-reassign
        foundFriend.friendRequestIn = foundFriend.friendRequestIn.filter(
          (request) => request.toString() !== userProfile._id.toString(),
        );

        return foundFriend.save();
      })
      .then(() => {
        userProfile.friendRequestOut = userProfile.friendRequestOut.filter(
          (request) => request !== reqFriendId,
        );

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
      return res.status(400).json({ error: errors.array() });
    }

    const reqFriendId = new mongoose.mongo.ObjectId(req.body.acceptedFriend);
    let userProfile;

    Profile.findOne({ user: req.user.id })
      .then((foundUserProfile) => {
        if (!foundUserProfile) {
          return res.status(400).json({ message: 'didnt found your Profile' });
        }
        userProfile = foundUserProfile;

        return Profile.findById(req.body.acceptedFriend);
      })
      .then((foundFriend) => {
        if (!foundFriend) {
          return res
            .status(400)
            .json({ message: 'didnt found your Friends Profile' });
        }

        if (
          // eslint-disable-next-line operator-linebreak
          !foundFriend.friendRequestOut.includes(userProfile._id) ||
          !userProfile.friendRequestIn.includes(foundFriend._id)
        ) {
          return res
            .status(400)
            .json({ message: 'There is no request to accept' });
        }

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
        if (userProfile.friends.includes(reqFriendId)) {
          return res
            .status(400)
            .json({ message: 'you are already a friend of him' });
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

exports.uploadPicturePost = [
  upload.single('photo'),
  (req, res, next) => {
    Profile.findOne({ user: req.user.id })
      .then((foundUserProfile) => {
        if (!foundUserProfile) {
          return res.status(400).json({ message: 'didnt found your Profile' });
        }

        if (foundUserProfile.photo !== 'profile.jpg') {
          unlink(`./images/${foundUserProfile.photo}`, (err) => {
            if (err) {
              // eslint-disable-next-line no-console
              console.log(err);
            }
          });
        }
        // eslint-disable-next-line no-param-reassign
        foundUserProfile.photo = req.file.filename;
        return foundUserProfile.save();
      })
      .then(() => res.status(201).json({ message: 'photo added' }))
      .catch((err) => next(err));
  },
];

exports.getFriendsGet = (req, res, next) => {
  Profile.findById(req.params.id)
    .populate({
      path: 'friends',
      // Get friends of friends - populate the 'friends' array for every friend
      populate: { path: 'friends' },
    })
    .then((profile) => {
      if (!profile) {
        return res.status(400).json({ message: 'didnt found your Friends' });
      }
      return res.status(200).json({ friends: profile.friends });
    })
    .catch((err) => next(err));
};

exports.getFriendRequestsGet = (req, res, next) => {
  Profile.findById(req.params.id)
    .populate({
      path: 'friendRequestIn',
      // Get friends of friends - populate the 'friends' array for every friend
      populate: { path: 'friendRequestIn' },
    })
    .then((profile) => {
      if (!profile) {
        return res.status(400).json({ message: 'didnt found your Friends' });
      }
      return res.status(200).json({ friendRequests: profile.friendRequestIn });
    })
    .catch((err) => next(err));
};

exports.searchProfileGet = (req, res, next) => {
  Profile.find({
    $expr: {
      $regexMatch: {
        input: { $concat: ['$firstName', ' ', '$lastName'] },
        regex: req.params.name,
        options: 'i',
      },
    },
  })
    .limit(5)
    .exec()
    .then((profiles) => {
      if (!profiles) {
        return res.status(400).json({ message: 'didnt found a Profile' });
      }
      return res.status(200).json({ profiles });
    })
    .catch((err) => next(err));
};

exports.getProfileByIdGet = (req, res, next) => {
  Profile.findById(req.params.id)
    .exec()
    .then((profile) => {
      if (!profile) {
        return res.status(400).json({ message: 'didnt found this Profile' });
      }
      return res.status(200).json({ profile });
    })
    .catch((err) => next(err));
};
