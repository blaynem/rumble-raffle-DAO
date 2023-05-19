import {
  BASE_API_URL_DEV,
  BASE_API_URL_PROD,
  BASE_WEB_URL_DEV,
  BASE_WEB_URL_PROD
} from '@rumble-raffle-dao/types/constants'
import dotenv from 'dotenv'
dotenv.config()

// Rumble Raffles guild ID
const RUMBLE_RAFFLE_GUILD_ID = '975608872276492299'
// Rumble Raffles "logging" channel id
const PROD_LOGGING_CHANNEL_ID = '1044060441070030858'
// Rumble Raffles "logging" channel id
const TEST_LOGGING_CHANNEL_ID = '1044061203074388018'

let APP_ID: string
let BASE_API_URL: string
let BASE_WEB_URL: string
let DISCORD_TOKEN: string
let LOGGING_CHANNEL_ID: string
if (process.env.NODE_ENV === 'production') {
  APP_ID = process.env.PROD_APP_ID!
  BASE_WEB_URL = BASE_WEB_URL_PROD
  BASE_API_URL = BASE_API_URL_PROD
  DISCORD_TOKEN = process.env.PROD_DISCORD_TOKEN!
  LOGGING_CHANNEL_ID = PROD_LOGGING_CHANNEL_ID
} else {
  APP_ID = process.env.TEST_APP_ID!
  BASE_WEB_URL = BASE_WEB_URL_DEV
  BASE_API_URL = BASE_API_URL_DEV
  DISCORD_TOKEN = process.env.TEST_DISCORD_TOKEN!
  LOGGING_CHANNEL_ID = TEST_LOGGING_CHANNEL_ID
}

export {
  APP_ID,
  BASE_API_URL,
  BASE_WEB_URL,
  DISCORD_TOKEN,
  RUMBLE_RAFFLE_GUILD_ID,
  LOGGING_CHANNEL_ID
}
