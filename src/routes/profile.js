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
  '/friendRequestPost',
  passport.authenticate('jwt', { session: false }),
  profileController.friendRequestPut,
);

router.put(
  '/acceptFriendrequest',
  passport.authenticate('jwt', { session: false }),
  profileController.acceptFriendrequestPut,
);

router.post(
  '/picture',
  passport.authenticate('jwt', { session: false }),
  profileController.uploadPicturePost,
);

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  profileController.getProfileByIdGet,
);

module.exports = router;
