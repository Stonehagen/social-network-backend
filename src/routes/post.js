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

router.get('/latest/:limit', postController.getLatestPostsGet);

module.exports = router;
