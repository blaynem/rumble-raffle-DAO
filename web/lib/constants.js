import { BASE_API_URL_DEV, BASE_API_URL_PROD, BASE_WEB_URL_DEV, BASE_WEB_URL_PROD } from "@rumble-raffle-dao/types/constants";

let BASE_API_URL;
let BASE_WEB_URL;
let DISCORD_CLIENT_ID;
let DISCORD_CLIENT_SECRET;
if (process.env.NODE_ENV === 'development') {
  BASE_API_URL = BASE_API_URL_DEV
  BASE_WEB_URL = BASE_WEB_URL_DEV
  DISCORD_CLIENT_ID = process.env.TEST_APP_ID
  DISCORD_CLIENT_SECRET = process.env.TEST_DISCORD_OAUTH_SECRET
} else {
  BASE_API_URL = BASE_API_URL_PROD
  BASE_WEB_URL = BASE_WEB_URL_PROD
  DISCORD_CLIENT_ID = process.env.PROD_APP_ID
  DISCORD_CLIENT_SECRET = process.env.PROD_DISCORD_OAUTH_SECRET
}

export { BASE_API_URL, BASE_WEB_URL, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET };