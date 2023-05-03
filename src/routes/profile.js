const { Router } = require('express');
const passport = require('passport');
const profileController = require('../controllers/profileController');

require('../config/passport');

const router = Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  profileController.profileGet,
);

router.put(
  '/',
  passport.authenticate('jwt', { session: false }),
  profileController.profilePut,
);

router.get(
  '/latest',
  passport.authenticate('jwt', { session: false }),
  profileController.latestProfileGet,
);

router.put(
  '/friendRequest',
  passport.authenticate('jwt', { session: false }),
  profileController.friendRequestPut,
);

router.put(
  '/friendRequest/cancel',
  passport.authenticate('jwt', { session: false }),
  profileController.friendRequestCancelPut,
);

router.put(
  '/acceptFriendrequest',
  passport.authenticate('jwt', { session: false }),
  profileController.acceptFriendRequestPut,
);

router.post(
  '/picture',
  passport.authenticate('jwt', { session: false }),
  profileController.uploadPicturePost,
);

router.get(
  '/friends/:id',
  passport.authenticate('jwt', { session: false }),
  profileController.getFriendsGet,
);

router.get(
  '/friendRequests/:id',
  passport.authenticate('jwt', { session: false }),
  profileController.getFriendRequestsGet,
);

router.get(
  '/search/:name',
  passport.authenticate('jwt', { session: false }),
  profileController.searchProfileGet,
);

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  profileController.getProfileByIdGet,
);

module.exports = router;
