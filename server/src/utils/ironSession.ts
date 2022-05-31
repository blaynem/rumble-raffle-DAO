import { ironSession } from "iron-session/express";

const session = ironSession({
  password: 'complex_password_at_least_32_characters_long',
  cookieName: 'rumbleRaffle_cookiename',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production'
  }
});

export default session;