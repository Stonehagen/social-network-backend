const { Router } = require('express');
const passport = require('passport');
const roomController = require('../controllers/roomController');

require('../config/passport');

const router = Router();

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  roomController.roomGet,
);

router.post(
  '/new',
  passport.authenticate('jwt', { session: false }),
  roomController.createRoomPost,
);

router.put(
  '/add/:id',
  passport.authenticate('jwt', { session: false }),
  roomController.addPut,
);

router.put(
  '/remove/:id',
  passport.authenticate('jwt', { session: false }),
  roomController.removePut,
);

router.delete(
  '/delete/:id',
  passport.authenticate('jwt', { session: false }),
  roomController.roomDelete,
);

module.exports = router;
