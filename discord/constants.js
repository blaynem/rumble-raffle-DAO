require('dotenv').config()
import { BASE_API_URL_DEV, BASE_API_URL_PROD, BASE_WEB_URL_DEV, BASE_WEB_URL_PROD } from "@rumble-raffle-dao/types/constants";

const RUMBLE_RAFFLE_GUILD_ID = '975608872276492299';

let APP_ID;
let BASE_API_URL;
let BASE_WEB_URL;
let DISCORD_TOKEN;
if (process.env.NODE_ENV === 'development') {
  APP_ID = process.env.TEST_APP_ID
  BASE_WEB_URL = BASE_WEB_URL_DEV
  BASE_API_URL = BASE_API_URL_DEV
  DISCORD_TOKEN = process.env.TEST_DISCORD_TOKEN;
} else {
  APP_ID = process.env.PROD_APP_ID
  BASE_WEB_URL = BASE_WEB_URL_PROD
  BASE_API_URL = BASE_API_URL_PROD
  DISCORD_TOKEN = process.env.PROD_DISCORD_TOKEN;
}

export { APP_ID, BASE_API_URL, BASE_WEB_URL, DISCORD_TOKEN, RUMBLE_RAFFLE_GUILD_ID };