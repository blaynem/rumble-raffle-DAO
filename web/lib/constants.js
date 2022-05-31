import { BASE_API_URL_DEV, BASE_API_URL_PROD, BASE_WEB_URL_DEV, BASE_WEB_URL_PROD } from "@rumble-raffle-dao/types/constants";

let BASE_API_URL;
let BASE_WEB_URL;
if (process.env.NODE_ENV === 'development') {
  BASE_API_URL = BASE_API_URL_DEV
  BASE_WEB_URL = BASE_WEB_URL_DEV
} else {
  BASE_API_URL = BASE_API_URL_PROD
  BASE_WEB_URL = BASE_WEB_URL_PROD
}

export { BASE_API_URL, BASE_WEB_URL };