const { Router } = require('express');
const passport = require('passport');
const roomController = require('../controllers/roomController');

require('../config/passport');

const router = Router();

router.get(
  '/new',
  passport.authenticate('jwt', { session: false }),
  roomController.createRoomPost,
);

router.put(
  '/rename/:id',
  passport.authenticate('jwt', { session: false }),
  roomController.renamePut,
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
