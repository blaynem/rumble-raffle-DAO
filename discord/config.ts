require('dotenv').config()
import { DEFAULT_GAME_ROOM } from "@rumble-raffle-dao/types/constants";
import { BASE_WEB_URL } from "./constants";
import { Config as GuildConfig } from "./src/guildContext/types";

interface Config {
  /**
   * The URL for the home site.
   */
  siteUrl: string;
  /**
   * Discord secret password for making api calls to our backend.
   * TODO: Get some better security, man!
   */
  discord_secret: string;
}

export const CONFIG: Config = {
  siteUrl: BASE_WEB_URL,
  discord_secret: process.env.DISCORD_SECRET_PASS
}

const rumbleRaffleServer: GuildConfig = {
  adminRoleIds: ['983206950311452752'],
  guildId: '975608872276492299',
  slug: DEFAULT_GAME_ROOM,
}

/**
 * All guild configs
 */
export const guildConfigs: GuildConfig[] = [
  rumbleRaffleServer,
  {
    adminRoleIds: ['983206950311452752'],
    guildId: '975608872276492299',
    slug: 'test2',
  },
  {
    adminRoleIds: ['983206950311452752'],
    guildId: '975608872276492299',
    slug: 'reee',
  },
  {
    adminRoleIds: ['983206950311452752'],
    guildId: '975608872276492299',
    slug: 'test52',
  }
]