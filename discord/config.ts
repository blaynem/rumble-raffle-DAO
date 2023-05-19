import { BASE_WEB_URL } from './constants'

interface Config {
  /**
   * The URL for the home site.
   */
  siteUrl: string
  /**
   * Discord secret password for making api calls to our backend.
   * TODO: Get some better security, man!
   */
  discord_secret: string
}

export const CONFIG: Config = {
  siteUrl: BASE_WEB_URL,
  discord_secret: process.env.DISCORD_SECRET_PASS!
}
