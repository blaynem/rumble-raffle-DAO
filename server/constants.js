let BASE_WEB_URL;
if (process.env.NODE_ENV === 'development') {
  BASE_WEB_URL = 'http://localhost:3000'
} else {
  BASE_WEB_URL = 'https://rumble-raffle-dao.herokuapp.com'
}

export {BASE_WEB_URL};