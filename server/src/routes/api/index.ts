import {
  SERVER_ACTIVITIES,
  SERVER_AUTH_DISCORD,
  SERVER_ROOMS,
  SERVER_USERS
} from '@rumble-raffle-dao/types/constants'
import express, { ErrorRequestHandler } from 'express'

const router = express.Router()

router.use(SERVER_ROOMS, require('./rooms'))
router.use(SERVER_USERS, require('./users'))
router.use(SERVER_AUTH_DISCORD, require('./auth_discord'))
router.use(SERVER_ACTIVITIES, require('./activities').router)

const errorHandle: ErrorRequestHandler = (err: any, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors: Record<string, string> = {}

    Object.keys(err.errors).forEach(key => {
      errors[key] = err.errors[key].message
    })

    return res.status(422).json({ errors })
  }

  return next(err)
}
router.use(errorHandle)

module.exports = router
