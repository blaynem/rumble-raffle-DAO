import { PickFromPlayers } from "@rumble-raffle-dao/types";
import client from "./client";

export const getUserFromUserTag = (tag: string) => {
  const user = client.users.cache.find(u => {
    return u.tag === tag;
  })
  return user;
}

/**
 * Returns the template literal for discord to tag a user 
 * @param discordId - The id of the discord user
 */
export const tagUser = (discordId: string) => `<@${discordId}>`

export const mapAllPlayersToDiscordId = (allPlayerData: PickFromPlayers[]) => allPlayerData.map(player => player.discord_id ? tagUser(player.discord_id) : player.name)