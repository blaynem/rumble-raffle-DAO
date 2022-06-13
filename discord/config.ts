require('dotenv').config()
import { DEFAULT_GAME_ROOM } from "@rumble-raffle-dao/types/constants";
import { BASE_WEB_URL } from "./constants";

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
   * The discord guild id we want to act on
   */
  guildId: string;
  /**
   * Admins role Id in the discord server
   */
  adminRoleId: string;
}

const RUMBLE_CHANNEL_ID = '984225124582580305';
const TEST_RUMBLE_CHANNEL_ID = '984191202112987186';
const channelId = (process.env.NODE_ENV === 'development') ? TEST_RUMBLE_CHANNEL_ID : RUMBLE_CHANNEL_ID;

const adminRoleId = '983206950311452752'

export const CONFIG: Config = {
  channelId,
  roomSlug: DEFAULT_GAME_ROOM,
  gameUrl: `${BASE_WEB_URL}/play`,
  guildId: process.env.GUILD_ID,
  adminRoleId,
}