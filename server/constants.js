let CORS_BASE_WEB_URL;
if (process.env.NODE_ENV === 'development') {
  CORS_BASE_WEB_URL = 'http://localhost:3000'
} else {
  CORS_BASE_WEB_URL = ['https://www.rumbleraffle.com', 'https://beta.rumbleraffle.com']
}

export {CORS_BASE_WEB_URL};