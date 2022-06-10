import { SERVER_ACTIVITIES, SERVER_AUTH_DISCORD, SERVER_ROOMS } from '@rumble-raffle-dao/types/constants';
import express from 'express';

const router = express.Router();

router.use(SERVER_ROOMS, require('./rooms'));
router.use(SERVER_AUTH_DISCORD, require('./auth_discord'));
router.use(SERVER_ACTIVITIES, require('./activities').router);

router.use(function (err, req, res, next) {
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function (errors, key) {
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;