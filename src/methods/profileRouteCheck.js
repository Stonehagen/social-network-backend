/* eslint-disable no-underscore-dangle */
exports.checkDoubleRequest = (res, array, id) => {
  if (array.includes(id)) {
    return res
      .status(400)
      .json({ message: 'you already made this friend request' });
  }
  return false;
};

exports.checkIfFriends = (res, array, id) => {
  if (array.includes(id)) {
    return res.status(400).json({ message: 'you are already a friend of him' });
  }
  return false;
};

exports.checkIfRequestIsMade = (res, friendProfile, userProfile) => {
  if (
    // eslint-disable-next-line operator-linebreak
    !friendProfile.friendRequestOut.includes(userProfile._id) ||
    !userProfile.friendRequestIn.includes(friendProfile._id)
  ) {
    return res.status(400).json({ message: 'There is no request to accept' });
  }
  return true;
};
