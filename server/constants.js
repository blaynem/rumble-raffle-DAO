let BASE_WEB_URL;
if (process.env.NODE_ENV === 'development') {
  BASE_WEB_URL = 'http://localhost:3000'
} else {
  BASE_WEB_URL = 'https://rumble-raffle-1ey8jwut1-rumble-raffle-dao.vercel.app/'
}

export {BASE_WEB_URL};