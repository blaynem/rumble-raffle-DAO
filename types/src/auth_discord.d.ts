
/** STORE TYPINGS */

export interface StoreState {
  [key: string]: AuthStoreValue
}

export type AuthStoreValue = {
  verify_id: string;
  discord_id: string;
  expireTime: number;
}

export interface AuthStore {
  add: (value: AuthDiscordInitBody, msToExpire: number) => AuthStoreValue;
  get: (key: string) => AuthStoreValue | null;
}

export type AuthDiscordInitBody = {
  discord_id: string;
}

/** VERIFY GET TYPES */

export interface AuthDiscordVerifyGetBody extends express.Request {
  params: {
    verify_id: string;
  }
}

export interface AuthDiscordVerifyGetResponse {
  data: AuthStoreValue;
  error?: string;
}

/** INIT POST TYPES */

export interface AuthDiscordInitPostBody extends express.Request {
  body: AuthDiscordInitBody
}

export interface AuthDiscordInitPostResponse {
  data: { verify_link: string } & AuthStoreValue;
  error?: string;
}

/** VERIFY POST TYPES */

export interface VerifyDiscordId {
  signature: string;
  public_address: string;
  verify_id: string;
}

export interface AuthDiscordVerifyPostBody extends express.Request {
  body: VerifyDiscordId
}

export interface AuthDiscordVerifyPostResponse {
  data: string;
  error?: string;
}