import { RoomDataType } from "@rumble-raffle-dao/types";
import { MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";
import { JOIN_GAME_EMOJI } from ".";
import client from "../../client";
import { verifyAccountButton } from "../buttons";
import { GuildContext } from "../guildContext";

const NEXT_RUMBLE_BEGINS = "LET'S GET READY TO RUMBLE!";

const nextRumbleDescription = () => `
Click the ${JOIN_GAME_EMOJI} icon below to join.

**Want to earn?**
If you'd like to earn tokens and and save your progress, click the 'Verify' button below.

Presented by [www.RumbleRaffle.com](www.RumbleRaffle.com)
`

/**
 * Creates and sends the Current Player Embed message.
 * @param channel - The channel to send the embed to
 */
export const createAndSendCurrentPlayerEmbed = async (guild: GuildContext, channel: TextChannel, paramsId: string) => {
  const embed = new MessageEmbed()
    .setColor('#9912B8')
    .setTitle(NEXT_RUMBLE_BEGINS)
    .setURL(guild.getGameUrl())
    .setDescription(nextRumbleDescription())
    .setFooter({ text: paramsId })

  const button = new MessageButton()
    .setCustomId(verifyAccountButton.customId)
    .setLabel('Verify')
    .setStyle('SECONDARY');

  const row = new MessageActionRow()
    .addComponents(button);

  // Set the currentMessage to this message.
  const message = await channel.send({ embeds: [embed], content: '', components: [row] })
  guild.setCurrentMessage(message);
  guild.setCurrentParamsId(paramsId)

  guild.getCurrentMessage().react(JOIN_GAME_EMOJI);
}

export const newGameCreated = (guild: GuildContext, roomData: RoomDataType) => {
  const channel = client.channels.cache.get(guild.channelId) as TextChannel;
  createAndSendCurrentPlayerEmbed(guild, channel, roomData.params.id);
  guild.setCurrentRound(null);
  guild.setGameStarted(false);
}