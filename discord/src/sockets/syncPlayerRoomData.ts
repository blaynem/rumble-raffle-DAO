import { SyncPlayersResponseType } from "@rumble-raffle-dao/types";
import { TextChannel } from "discord.js";
import client from "../../client";
import { GuildContext } from "../guildContext";
import { createAndSendCurrentPlayerEmbed } from "./newGameCreated";

/**
 * Useful to sync the player room data to discord if it's been awhile since the last CURRENT ENTRANTS message.
 */
export const syncPlayerRoomData = (guild: GuildContext, { data, paramsId, error }: SyncPlayersResponseType, slug: string) => {
  const channel = client.channels.cache.get(guild.channelId) as TextChannel;

  if (error) {
    channel.send(error);
    return;
  }

  // Create and send the current player embed message.
  createAndSendCurrentPlayerEmbed(guild, channel, paramsId);
}