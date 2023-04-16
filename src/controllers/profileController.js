/* eslint-disable no-underscore-dangle */
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const { Profile } = require('../models');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const filefilter = (req, file, cb) => {
  const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage, filefilter });

const checkErrors = (res, errors, code) => {
  if (!errors.isEmpty()) {
    return res.status(code).json({ errors: errors.array() });
  }
  return false;
};

const checkFound = (res, found, code, message) => {
  if (!found) {
    return res.status(code).json({ message });
  }
  return true;
};

const checkDoubleRequest = (res, array, id) => {
  if (array.includes(id)) {
    return res
      .status(400)
      .json({ message: 'you already made this friend request' });
  }
  return false;
};

const checkIfFriends = (res, array, id) => {
  if (array.includes(id)) {
    return res.status(400).json({ message: 'you are already a friend of him' });
  }
  return false;
};

const checkIfRequestIsMade = (res, friendProfile, userProfile) => {
  if (
    // eslint-disable-next-line operator-linebreak
    !friendProfile.friendRequestOut.includes(userProfile._id) ||
    !userProfile.friendRequestIn.includes(friendProfile._id)
  ) {
    return res.status(400).json({ message: 'There is no request to accept' });
  }
  return true;
};

exports.friendRequestPut = [
  body('requestedFriend', 'who?').trim().notEmpty().escape(),
  // eslint-disable-next-line consistent-return
  (req, res, next) => {
    checkErrors(res, validationResult(req), 400);

    const reqFriendId = new mongoose.mongo.ObjectId(req.body.requestedFriend);
    let userProfile;

    Profile.findOne({ user: req.user.id })
      .then((foundUserProfile) => {
        checkFound(res, foundUserProfile, 404, 'didnt found your Profile');
        userProfile = foundUserProfile;

        return Profile.findById(req.body.requestedFriend);
      })
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
