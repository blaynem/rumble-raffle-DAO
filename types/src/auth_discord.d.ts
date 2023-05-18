/** STORE TYPINGS */

export interface StoreState {
  [key: string]: AuthStoreValue
}

export type AuthStoreValue = {
  verification_id: string
  discord_id: string
  discord_tag: string
  expireTime: number
}

export interface AuthStore {
  add: (value: AuthDiscordInitBody, msToExpire: number) => AuthStoreValue
  get: (key: string) => AuthStoreValue | null
  remove: (key: string) => void
}

export type AuthDiscordInitBody = {
  discord_id: string
  discord_tag: string
}

/** VERIFY GET TYPES */

export interface AuthDiscordVerifyGetBody extends express.Request {
  params: {
    verification_id: string
  }
}

export interface AuthDiscordVerifyGetResponse {
  data: AuthStoreValue | null
  error?: string
}

/** INIT POST TYPES */

export interface AuthDiscordInitPostBody extends express.Request {
  body: AuthDiscordInitBody
}

export interface AuthDiscordInitPostResponse {
  data: ({ verify_link: string } & AuthStoreValue) | null
  error?: string
}

/** VERIFY POST TYPES */

export interface VerifyDiscordId {
  signature: string
  public_address: string
  verification_id: string
}

export interface AuthDiscordVerifyPostBody extends express.Request {
  body: VerifyDiscordId
}

export interface AuthDiscordVerifyPostResponse {
  data: string | null
  error?: string
}
