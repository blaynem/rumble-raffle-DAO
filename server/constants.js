import { BASE_WEB_URL_DEV, BASE_WEB_URL_PROD } from "@rumble-raffle-dao/types/constants";

let CORS_BASE_WEB_URL;
if (process.env.NODE_ENV === 'development') {
  CORS_BASE_WEB_URL = BASE_WEB_URL_DEV
} else {
  CORS_BASE_WEB_URL = BASE_WEB_URL_PROD
}

export { CORS_BASE_WEB_URL };