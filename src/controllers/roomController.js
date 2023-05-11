/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const { Room, Profile } = require('../models');

exports.roomGet = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(400).json({ message: 'didnt found your Chat' });
    }
    return res.status(200).json({ room });
  } catch {
    return res.status(400).json({ message: 'didnt found your Chat' });
  }
};

exports.createRoomPost = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(400).json({ message: 'didnt found your Profile' });
    }

    const chatPartnerProfile = await Profile.findById(req.body.chatPartner);

    if (!chatPartnerProfile) {
      return res.status(400).json({ message: 'didnt found your Chatpartner' });
    }

    const room = new Room({
      _id: new mongoose.Types.ObjectId(),
      users: [profile._id, chatPartnerProfile._id],
    });

    if (!profile.rooms) {
      profile.rooms = [room._id];
    } else {
      profile.rooms.push(room._id);
    }

    await room.save();
    await profile.save();
    return res.status(201).json({ room });
  } catch {
    return res.status(400).json({ message: 'Something went wrong' });
  }
};

exports.addPut = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(400).json({ message: 'Room not found' });
    }

    const profile = await Profile.findById(req.body.profile);

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

    const profile = await Profile.findById(req.body.profile);

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
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(400).json({ message: 'didnt found your Profile' });
    }

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(400).json({ message: 'Room not found' });
    }

    profile.rooms = profile.rooms.filter(
      (id) => id.toString() !== req.params.id,
    );

    await room.findByIdAndRemove(req.params.id);
    await profile.save();
    return res.status(201).json({ message: 'Remove room successful' });
  } catch {
    return res.status(400).json({ message: 'Cant remove room' });
  }
};
