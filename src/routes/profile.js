const { Router } = require('express');
const passport = require('passport');
const profileController = require('../controllers/profileController');

require('../config/passport');

const router = Router();

router.post(
  '/friendRequestPost',
  passport.authenticate('jwt', { session: false }),
  profileController.friendRequestPut,
);

module.exports = router;
