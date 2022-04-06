let BASE_API_URL;
let BASE_WEB_URL;
if (process.env.NODE_ENV === 'development') {
  BASE_API_URL = 'http://localhost:3001';
  BASE_WEB_URL = 'http://localhost:3000'
} else {
  BASE_API_URL = 'https://rumble-raffle-dao.herokuapp.com'
  BASE_WEB_URL = 'https://rumble-raffle-dao-iota.vercel.app'
}

export {BASE_API_URL, BASE_WEB_URL};
export const NONCE_MESSAGE = 'I am ready to rumble!'