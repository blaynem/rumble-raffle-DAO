import { SyncPlayersResponseType } from "@rumble-raffle-dao/types";
import { AnyChannel, TextChannel } from "discord.js";
import client from "../../client";
import { GuildContext } from "../guildContext";
import { createAndSendCurrentPlayerEmbed } from "./newGameCreated";

/**
 * Useful to sync the player room data to discord if it's been awhile since the last CURRENT ENTRANTS message.
 */
export const syncPlayerRoomData = (guild: GuildContext, { data, paramsId, error }: SyncPlayersResponseType, slug: string) => {
  const channel: AnyChannel = client.channels.cache.get(guild.channelId) as TextChannel;
  const allPlayerData = data?.map(player => ({
    ...player,
    discord_id: player.discord_id
  }));

  if (error) {
    channel.send(error);
    return;
  }

  // Create and send the current player embed message.
  createAndSendCurrentPlayerEmbed(guild, channel, paramsId);
}