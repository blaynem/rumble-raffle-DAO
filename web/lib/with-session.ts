import { IronSessionUserData } from '@rumble-raffle-dao/types'
import { IronSessionOptions } from 'iron-session'
import { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next'

const sessionOptions: IronSessionOptions = {
  password: process.env.IRON_SESSION_PASS!,
  cookieName: 'rumbleRaffle_cookiename',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production'
  }
}

export function withSessionRoute(handler: any) {
  return withIronSessionApiRoute(handler, sessionOptions)
}

export function withSessionSsr(handler: any) {
  return withIronSessionSsr(handler, sessionOptions)
}

declare module 'iron-session' {
  interface IronSessionData {
    user?: IronSessionUserData
  }
}
