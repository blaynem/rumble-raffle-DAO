import { IronSessionUserData } from '@rumble-raffle-dao/types'
import { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next'

const sessionOptions = {
  password: 'complex_password_at_least_32_characters_long',
  cookieName: 'rumbleRaffle_cookiename',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production'
  }
}

export function withSessionRoute(handler) {
  return withIronSessionApiRoute(handler, sessionOptions)
}

export function withSessionSsr(handler) {
  return withIronSessionSsr(handler, sessionOptions)
}

declare module 'iron-session' {
  interface IronSessionData {
    user?: IronSessionUserData
  }
}