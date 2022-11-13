require('dotenv').config()
import { DEFAULT_GAME_ROOM } from "@rumble-raffle-dao/types/constants";
import { BASE_WEB_URL } from "./constants";
import { Config as GuildConfig } from "./src/guildContext/types";

interface Config {
  /**
   * Id of discord channel that text will be sent to.
   */
  channelId: string;
  /**
   * Room name in the database we want to listen to.
   */
  roomSlug: string;
  /**
   * The URL for the played games.
   */
  gameUrl: string;
  /**
   * The URL for the home site.
   */
  siteUrl: string;
  /**
   * The discord guild id we want to act on
   */
  guildId: string;
  /**
   * Admins role Id in the discord server
   */
  adminRoleId: string;
  /**
   * Discord secret password
   */
  discord_secret: string;
}

const RUMBLE_CHANNEL_ID = '984225124582580305';
const TEST_RUMBLE_CHANNEL_ID = '984191202112987186';
const channelId = (process.env.NODE_ENV === 'development') ? TEST_RUMBLE_CHANNEL_ID : RUMBLE_CHANNEL_ID;

const adminRoleId = '983206950311452752'

export const CONFIG: Config = {
  channelId,
  roomSlug: DEFAULT_GAME_ROOM,
  gameUrl: `${BASE_WEB_URL}/play`,
  siteUrl: BASE_WEB_URL,
  guildId: process.env.GUILD_ID,
  adminRoleId,
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
]