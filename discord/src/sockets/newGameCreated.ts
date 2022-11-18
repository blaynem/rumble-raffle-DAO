import { RoomDataType } from "@rumble-raffle-dao/types";
import { MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";
import { JOIN_GAME_EMOJI } from ".";
import client from "../../client";
import { verifyAccountCommand } from "../commands";
import { GuildContext } from "../guildContext";

const NEXT_RUMBLE_BEGINS = "LET'S GET READY TO RUMBLE!";

// Don't talk about any tokens or anything for now.
// const nextRumbleDescription = () => `
// Click the ${JOIN_GAME_EMOJI} icon below to join.

// **Want to earn?**
// If you'd like to earn tokens and and save your progress, type the \`${verifyAccountCommand.commandName}\` command and follow the prompts.

// Presented by [www.RumbleRaffle.com](www.RumbleRaffle.com)
// `
const nextRumbleDescription = () => `
Click the ${JOIN_GAME_EMOJI} icon below to join.

Presented by www.RumbleRaffle.com
`

/**
 * Creates and sends the Current Player Embed message.
 * @param channel - The channel to send the embed to
 */
export const createAndSendCurrentPlayerEmbed = async (guild: GuildContext, channel: TextChannel, paramsId: string) => {
  let footerText = guild.getCurrentParamsId() || ''
  // This is just to overwrite the free params id 
  if (footerText === 'FREE_PARAMS_ID') {
    footerText = '';
  }
  const embed = new MessageEmbed()
    .setColor('#9912B8')
    .setTitle(NEXT_RUMBLE_BEGINS)
    // .setURL(guild.getGameUrl()) // not sure we want to set the url right now
    .setDescription(nextRumbleDescription())
    .setFooter({ text: footerText })

  // Set the currentMessage to this message.
  const message = await channel.send({ embeds: [embed], content: 'New game created' })
  guild.setCurrentMessage(message);
  guild.setCurrentParamsId(paramsId)

  message.react(JOIN_GAME_EMOJI);
}

export const newGameCreated = (guild: GuildContext, roomData: RoomDataType) => {
  const channel = client.channels.cache.get(guild.getChannelId()) as TextChannel;

  createAndSendCurrentPlayerEmbed(guild, channel, roomData.params.id);
}