import { SERVER_BASE_PATH } from '@rumble-raffle-dao/types/constants';
import express from 'express';

const router = express.Router();

router.use(SERVER_BASE_PATH, require('./api'));

module.exports = router;