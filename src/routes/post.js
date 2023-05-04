const { Router } = require('express');
const passport = require('passport');
const postController = require('../controllers/postController');

require('../config/passport');

const router = Router();

router.post(
  '/new',
  passport.authenticate('jwt', { session: false }),
  postController.createPostPost,
);

router.get(
  '/user/:id',
  passport.authenticate('jwt', { session: false }),
  postController.getUserPostsGet,
);

router.get(
  '/latest/:limit',
  passport.authenticate('jwt', { session: false }),
  postController.getLatestPostsGet,
);

router.get(
  '/:postId',
  passport.authenticate('jwt', { session: false }),
  postController.getPostGet,
);

router.put(
  '/:postId',
  passport.authenticate('jwt', { session: false }),
  postController.editPostPut,
);

router.delete(
  '/:postId',
  passport.authenticate('jwt', { session: false }),
  postController.deletePostDelete,
);

module.exports = router;
