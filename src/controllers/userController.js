const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('dotenv/config');

const { User } = require('../models');

exports.createUserPost = [
  body('firstName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('first name be at least 2 chars long')
    .escape(),
  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('last name be at least 2 chars long')
    .escape(),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide valid Email')
    .escape(),
  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 chars long')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .escape(),
  // eslint-disable-next-line consistent-return
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    User.findOne({ email: req.body.email })
      .exec()
      .then((found) => {
        if (found) {
          return res.status(409).json({
            error: [
              {
                value: found.email,
                msg: 'Email already in use. Log in or use a different email.',
                param: 'email',
                location: 'body',
              },
            ],
          });
        }
        const user = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: req.body.password,
        });
        return user
          .save()
          .then(() => res.status(201).json({ message: 'user created' }));
      })
      .catch((err) => next(err));
  },
];

exports.logInUserPost = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide valid Email to log in.')
    .escape(),
  body('password', 'Please provide password to log in.').trim().escape(),
  // eslint-disable-next-line consistent-return
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(401).json({ error: errors.array() });
    }

    // eslint-disable-next-line consistent-return
    passport.authenticate('login', { session: false }, (err, user) => {
      if (err || !user) {
        return res.status(401).json({
          error: [
            {
              value: '',
              msg: "Sorry, we couldn't verify your login credentials. Please check your email and password and try again.",
              param: '',
              location: 'body',
            },
          ],
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.status(400).json({
            error: [
              {
                value: '',
                msg: 'Something went wrong. Please try again later!',
                param: '',
                location: '',
              },
            ],
          });
        }
        const daysToExpire = 60;
        const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
          expiresIn: `${daysToExpire}d`,
        });
        return res.json({ user, token });
      });
    })(req, res);
  },
];
