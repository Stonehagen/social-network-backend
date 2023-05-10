/* eslint-disable no-underscore-dangle */
const { body, validationResult } = require('express-validator');

const { Room, Profile } = require('../models');

exports.createRoomPost = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Name of room must be at least 3 chars long')
    .isLength({ max: 30 })
    .withMessage('Name of room cant be longer than 30 chars')
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

      const room = new Room({
        name: req.body.name,
        users: [profile._id],
      });

      await room.save();
      return res.status(201).json({ room });
    } catch {
      return res.status(400).json({ message: 'Something went wrong' });
    }
  },
];

exports.renamePut = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Name of room must be at least 3 chars long')
    .isLength({ max: 30 })
    .withMessage('Name of room cant be longer than 30 chars')
    .escape(),
  async (req, res) => {
    const errors = validationResult(req);

    try {
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const room = await Room.findById(req.params.id);

      if (!room) {
        return res.status(400).json({ message: 'Room not found' });
      }

      room.name = req.body.name;

      await room.save();
      return res.status(201).json({ message: 'Rename room successful' });
    } catch {
      return res.status(400).json({ message: 'Cant rename Room' });
    }
  },
];

exports.addPut = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(400).json({ message: 'Room not found' });
    }

    const profile = await Profile.findOne({ user: req.body.profile });

    if (!profile) {
      return res.status(400).json({ message: 'didnt found that Profile' });
    }

    room.users.push(profile._id);

    await room.save();
    return res.status(201).json({ message: 'Add user to room successful' });
  } catch {
    return res.status(400).json({ message: 'Cant add user to Room' });
  }
};

exports.removePut = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(400).json({ message: 'Room not found' });
    }

    const profile = await Profile.findOne({ user: req.body.profile });

    if (!profile) {
      return res.status(400).json({ message: 'didnt found that Profile' });
    }

    room.users = room.users.filter(
      (id) => id.toString() !== profile._id.toString(),
    );

    await room.save();
    return res
      .status(201)
      .json({ message: 'Remove user from room successful' });
  } catch {
    return res.status(400).json({ message: 'Cant remove user from room' });
  }
};

exports.roomDelete = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(400).json({ message: 'Room not found' });
    }

    await room.findByIdAndRemove(req.params.id);
    return res.status(201).json({ message: 'Remove room successful' });
  } catch {
    return res.status(400).json({ message: 'Cant remove room' });
  }
};
