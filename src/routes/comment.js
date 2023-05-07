const { Router } = require('express');
const passport = require('passport');
const commentController = require('../controllers/commentController');

require('../config/passport');

const router = Router();

router.post(
  '/new',
  passport.authenticate('jwt', { session: false }),
  commentController.createCommentPost,
);

router.put(
  '/like/:commentId',
  passport.authenticate('jwt', { session: false }),
  commentController.likeCommentPut,
);

router.put(
  '/unlike/:commentId',
  passport.authenticate('jwt', { session: false }),
  commentController.unlikeCommentPut,
);

module.exports = router;
