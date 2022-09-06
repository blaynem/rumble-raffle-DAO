import { DiscordPlayer, PickFromPlayers } from "@rumble-raffle-dao/types";
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

export const mapAllPlayersToDiscordId = (allPlayerData: (PickFromPlayers | DiscordPlayer)[]) => allPlayerData.map(player => {
  // Map player.id if id_origin is discord.
  if ((player as DiscordPlayer).id_origin === 'DISCORD') {
    return tagUser(player.id);
  };
  // If id origin is not discord, we want to check if they have a discord_id. Otherwise we use their name.
  const pickedPlayer = player as PickFromPlayers;
  return pickedPlayer.discord_id ? tagUser(pickedPlayer.discord_id) : pickedPlayer.name
})