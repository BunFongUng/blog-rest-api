import { check } from 'express-validator/check';
import User from './user.model';

export default {
  'register': [
      check('username', 'Username is required.').exists().custom(username => {
          return User.findByUsername(username).then(user => {
              if(user.length > 0) {
                  throw new Error('This username is already in use.');
              }

              return username;
          });
      }),
      check('email', 'Email is required and must be valid email.').exists().isEmail().custom(email => {
          return User.findByEmail(email).then(user => {
              if(user.length > 0) {
                  throw new Error('This email is already in use.');
              }

              return email;
          });
      }),
      check('password', 'password is required and must be 6 character long.').isLength({ min: 6 }).exists()
  ],
  'login': [
    check('email', 'Email is required and must be valid email.').exists().isEmail(),
    check('password', 'password is required and must be 6 character long.').isLength({ min: 6 }).exists()
  ]
};
