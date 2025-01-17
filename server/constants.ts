import { BASE_WEB_URL_DEV, BASE_WEB_URL_PROD } from '@rumble-raffle-dao/types/constants'

let CORS_BASE_WEB_URL: string
if (process.env.NODE_ENV === 'production') {
  CORS_BASE_WEB_URL = BASE_WEB_URL_PROD
} else {
  CORS_BASE_WEB_URL = BASE_WEB_URL_DEV
}

export { CORS_BASE_WEB_URL }
