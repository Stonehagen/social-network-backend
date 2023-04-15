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

    const userId = new mongoose.mongo.ObjectId(req.user.id);
    const reqFriendId = new mongoose.mongo.ObjectId(req.body.requestedFriend);

    Profile.findById(req.body.requestedFriend)
      .then((foundFriendProfile) => {
        if (!foundFriendProfile) {
          return res
            .status(404)
            .json({ message: 'didnt found Friend Profile' });
        }
        if (foundFriendProfile.friendRequestIn.includes(userId)) {
          return res
            .status(400)
            .json({ message: 'you already made an request' });
        }
        foundFriendProfile.friendRequestIn.push(userId);

        return foundFriendProfile.save();
      })
      .then(() => Profile.findOne({ user: req.user.id }))
      .then((foundUserProfile) => {
        if (!foundUserProfile) {
          return res.status(404).json({ message: 'diddnt found your Profile' });
        }
        if (foundUserProfile.friendRequestOut.includes(reqFriendId)) {
          return res
            .status(400)
            .json({ message: 'you already made an request' });
        }
        foundUserProfile.friendRequestOut.push(reqFriendId);

        return foundUserProfile.save();
      })
      .then(() => res.status(201).json({ message: 'friend request made' }))
      .catch((err) => next(err));
  },
];
