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

module.exports = router;
