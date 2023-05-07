/* eslint-disable no-underscore-dangle */
const { body, validationResult } = require('express-validator');
const { unlink } = require('fs');

const { upload } = require('../config/pictureStorage');
const { Profile } = require('../models');

exports.profileGet = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(400).json({ message: 'didnt found your Profile' });
    }
    return res.status(200).json({ profile });
  } catch {
    return res.status(400).json({ message: 'didnt found your Profile' });
  }
};

exports.latestProfileGet = async (req, res) => {
  const profiles = await Profile.find().sort({ _id: -1 }).limit(5);
  try {
    if (!profiles) {
      return res.status(400).json({ message: 'didnt found any Profiles' });
    }
    return res.status(200).json({ profiles });
  } catch {
    return res.status(400).json({ message: 'didnt get Profiles' });
  }
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
  async (req, res) => {
    const errors = validationResult(req);
    try {
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(400).json({ message: 'didnt found your Profile' });
      }

      profile.status = req.body.status;
      profile.firstName = req.body.firstName;
      profile.lastName = req.body.lastName;

      await profile.save();
      res.status(201).json({ message: 'profile changed' });
    } catch {
      return res.status(400).json({ message: 'there went something wrong' });
    }
  },
];

exports.friendRequestPut = [
  body('requestedFriend', 'who?').trim().notEmpty().escape(),
  // eslint-disable-next-line consistent-return
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      const userProfile = await Profile.findOne({ user: req.user.id });
      if (!userProfile) {
        return res.status(400).json({ message: 'didnt found your Profile' });
      }
      const friendProfile = await Profile.findById(req.body.requestedFriend);
      if (!friendProfile) {
        return res
          .status(400)
          .json({ message: 'didnt found your Friends Profile' });
      }

      if (friendProfile.friendRequestIn.includes(userProfile._id)) {
        return res
          .status(400)
          .json({ message: 'you already made this friend request' });
      }

      if (userProfile.friends.includes(friendProfile._id)) {
        return res
          .status(400)
          .json({ message: 'you are already a friend of him' });
      }

      // check if AI User and accept ot a given chance
      if (friendProfile.user === undefined && Math.random() < 0.7) {
        friendProfile.friends.push(userProfile._id);
        userProfile.friends.push(friendProfile._id);
      } else {
        if (!friendProfile.friendRequestIn) {
          friendProfile.friendRequestIn = [userProfile._id];
        } else {
          friendProfile.friendRequestIn.push(userProfile._id);
        }

        if (!userProfile.friendRequestOut) {
          userProfile.friendRequestOut = [friendProfile._id];
        } else {
          userProfile.friendRequestOut.push(friendProfile._id);
        }
      }

      await friendProfile.save();
      await userProfile.save();
      return res.status(201).json({ message: 'friend request made' });
    } catch {
      return res.status(400).json({ message: 'friend request failed' });
    }
  },
];

exports.friendRequestCancelPut = [
  body('requestedFriend', 'who?').trim().notEmpty().escape(),
  // eslint-disable-next-line consistent-return
  async (req, res) => {
    const errors = validationResult(req);

    try {
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const userProfile = await Profile.findOne({ user: req.user.id });
      if (!userProfile) {
        return res.status(400).json({ message: 'didnt found your Profile' });
      }
      const friendProfile = await Profile.findById(req.body.requestedFriend);
      if (!friendProfile) {
        return res
          .status(400)
          .json({ message: 'didnt found your Friends Profile' });
      }

      friendProfile.friendRequestIn = friendProfile.friendRequestIn.filter(
        (id) => id.toString() !== userProfile._id.toString(),
      );
      userProfile.friendRequestOut = userProfile.friendRequestOut.filter(
        (id) => id.toString() !== friendProfile._id.toString(),
      );

      await friendProfile.save();
      await userProfile.save();
      return res.status(201).json({ message: 'friend request made' });
    } catch {
      return res.status(400).json({ message: 'cancel friend request failed' });
    }
  },
];

exports.rejectFriendRequestPut = [
  body('acceptedFriend', 'who?').trim().notEmpty().escape(),
  // eslint-disable-next-line consistent-return
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    try {
      const userProfile = await Profile.findOne({ user: req.user.id });
      if (!userProfile) {
        return res.status(400).json({ message: 'didnt found your Profile' });
      }

      const friendProfile = await Profile.findById(req.body.acceptedFriend);
      if (!friendProfile) {
        return res
          .status(400)
          .json({ message: 'didnt found your Friends Profile' });
      }

      friendProfile.friendRequestOut = friendProfile.friendRequestOut.filter(
        (id) => id.toString() !== userProfile._id.toString(),
      );
      friendProfile.friendRequestIn = friendProfile.friendRequestIn.filter(
        (id) => id.toString() !== userProfile._id.toString(),
      );
      userProfile.friendRequestOut = userProfile.friendRequestOut.filter(
        (id) => id.toString() !== friendProfile._id.toString(),
      );
      userProfile.friendRequestIn = userProfile.friendRequestIn.filter(
        (id) => id.toString() !== friendProfile._id.toString(),
      );

      await friendProfile.save();
      await userProfile.save();
      return res.status(200).json({ message: 'friend request rejected' });
    } catch {
      return res
        .status(400)
        .json({ message: 'friend request rejection failed' });
    }
  },
];

exports.friendRemovePut = [
  body('friend', 'who?').trim().notEmpty().escape(),
  // eslint-disable-next-line consistent-return
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    try {
      const userProfile = await Profile.findOne({ user: req.user.id });
      if (!userProfile) {
        return res.status(400).json({ message: 'didnt found your Profile' });
      }

      const friendProfile = await Profile.findById(req.body.friend);
      if (!friendProfile) {
        return res
          .status(400)
          .json({ message: 'didnt found your Friends Profile' });
      }

      userProfile.friends = userProfile.friends.filter(
        (friend) => friend.toString() !== friendProfile._id.toString(),
      );

      friendProfile.friends = friendProfile.friends.filter(
        (friend) => friend.toString() !== userProfile._id.toString(),
      );

      await friendProfile.save();
      await userProfile.save();
      return res.status(200).json({ message: 'friend removed' });
    } catch {
      return res.status(400).json({ message: 'friend cant be removed' });
    }
  },
];

exports.acceptFriendRequestPut = [
  body('acceptedFriend', 'who?').trim().notEmpty().escape(),
  // eslint-disable-next-line consistent-return
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    try {
      const userProfile = await Profile.findOne({ user: req.user.id });
      if (!userProfile) {
        return res.status(400).json({ message: 'didnt found your Profile' });
      }

      const friendProfile = await Profile.findById(req.body.acceptedFriend);
      if (!friendProfile) {
        return res
          .status(400)
          .json({ message: 'didnt found your Friends Profile' });
      }

      if (userProfile.friends.includes(friendProfile._id)) {
        return res
          .status(400)
          .json({ message: 'you are already a friend of him' });
      }

      if (
        // eslint-disable-next-line operator-linebreak
        !friendProfile.friendRequestOut.includes(userProfile._id) ||
        !userProfile.friendRequestIn.includes(friendProfile._id)
      ) {
        return res
          .status(400)
          .json({ message: 'There is no request to accept' });
      }

      friendProfile.friendRequestOut = friendProfile.friendRequestOut.filter(
        (id) => id.toString() !== userProfile._id.toString(),
      );
      friendProfile.friendRequestIn = friendProfile.friendRequestIn.filter(
        (id) => id.toString() !== userProfile._id.toString(),
      );
      userProfile.friendRequestOut = userProfile.friendRequestOut.filter(
        (id) => id.toString() !== friendProfile._id.toString(),
      );
      userProfile.friendRequestIn = userProfile.friendRequestIn.filter(
        (id) => id.toString() !== friendProfile._id.toString(),
      );

      friendProfile.friends.push(userProfile._id);
      userProfile.friends.push(friendProfile._id);
      await friendProfile.save();
      await userProfile.save();
      return res.status(200).json({ message: 'friend request accepted' });
    } catch {
      return res.status(400).json({ message: 'friend request failed' });
    }
  },
];

exports.uploadPicturePost = [
  upload.single('photo'),
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(400).json({ message: 'didnt found your Profile' });
      }
      if (profile.photo !== 'profile.jpg') {
        unlink(`./images/${profile.photo}`, (err) => {
          if (err) {
            // eslint-disable-next-line no-console
            console.log(err);
          }
        });
      }

      profile.photo = req.file.filename;
      await profile.save();
      return res.status(201).json({ message: 'photo added' });
    } catch {
      return res.status(400).json({ message: 'photo upload went wrong' });
    }
  },
];

exports.getFriendsGet = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate({
      path: 'friends',
      populate: { path: 'friends' },
    });

    if (!profile) {
      return res.status(400).json({ message: 'didnt found your Friends' });
    }
    return res.status(200).json({ friends: profile.friends });
  } catch {
    return res.status(400).json({ message: 'didnt found your Friends' });
  }
};

exports.getFriendRequestsGet = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate({
      path: 'friendRequestIn',
      populate: { path: 'friendRequestIn' },
    });

    if (!profile) {
      return res
        .status(400)
        .json({ message: 'didnt found your Friendrequests' });
    }
    return res.status(200).json({ friendRequests: profile.friendRequestIn });
  } catch {
    return res
      .status(400)
      .json({ message: 'didnt found your Friend requests' });
  }
};

exports.getFriendRequestsOutGet = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate({
      path: 'friendRequestOut',
      populate: { path: 'friendRequestOut' },
    });

    if (!profile) {
      return res
        .status(400)
        .json({ message: 'didnt found your Friendrequests' });
    }
    return res
      .status(200)
      .json({ friendRequestsOut: profile.friendRequestOut });
  } catch {
    return res
      .status(400)
      .json({ message: 'didnt found your Friend requests' });
  }
};

exports.searchProfileGet = async (req, res) => {
  try {
    const profiles = await Profile.find({
      $expr: {
        $regexMatch: {
          input: { $concat: ['$firstName', ' ', '$lastName'] },
          regex: req.params.name,
          options: 'i',
        },
      },
    });
    if (!profiles) {
      return res.status(400).json({ message: 'didnt found a Profile' });
    }
    return res.status(200).json({ profiles });
  } catch {
    return res.status(400).json({ message: 'didnt found any Profile' });
  }
};

exports.getProfileByIdGet = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(400).json({ message: 'didnt found this Profile' });
    }
    return res.status(200).json({ profile });
  } catch {
    return res.status(400).json({ message: 'didnt found this Profile' });
  }
};
