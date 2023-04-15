const { Router } = require('express');
const passport = require('passport');
const profileController = require('../controllers/profileController');

require('../config/passport');

const router = Router();

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

module.exports = router;
