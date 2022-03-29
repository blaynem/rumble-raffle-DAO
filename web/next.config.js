require('dotenv').config()

module.exports = {
  reactStrictMode: true,
  env: {
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
    POLYGONSCAN_API_KEY: process.env.POLYGONSCAN_API_KEY,
    RUMBLE_CONTRACT_ADDRESS: process.env.RUMBLE_CONTRACT_ADDRESS,
    DEV_TOKEN_CONTRACT_ADDRESS: process.env.TOKEN_CONTRACT_ADDRESS,
  }
}