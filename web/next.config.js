require('dotenv').config()

module.exports = {
  reactStrictMode: true,
  env: {
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
    POLYGONSCAN_API_KEY: process.env.POLYGONSCAN_API_KEY,
    IRON_SESSION_PASS: process.env.IRON_SESSION_PASS,
    PROD_APP_ID: process.env.PROD_APP_ID,
    TEST_APP_ID: process.env.TEST_APP_ID,
    PROD_DISCORD_OAUTH_SECRET: process.env.PROD_DISCORD_OAUTH_SECRET,
    TEST_DISCORD_OAUTH_SECRET: process.env.TEST_DISCORD_OAUTH_SECRET,
  }
}