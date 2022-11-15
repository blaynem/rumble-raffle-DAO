import { AnyChannel, MessageEmbed, TextChannel } from "discord.js";
import client from "../../client";
import { GuildContext } from "../guildContext";

export const simpleMessageEmbed = (guild: GuildContext, channel: TextChannel, message: string, title?: string) => {
  const embed = new MessageEmbed()
    .setColor('#9912B8')
    .setDescription(message)

  if (title) {
    embed
      .setTitle(title)
    // .setURL(guild.getGameUrl()) // not sure we want to link anywhere rn
  }

  channel.send({ embeds: [embed] })
}

export const gameStartCountdown = (guild: GuildContext, timeToStart: number) => {
  const channel: AnyChannel = client.channels.cache.get(guild.getChannelId()) as TextChannel;
  simpleMessageEmbed(guild, channel, `Game starting in **${timeToStart} seconds**.`, 'Prepare for battle!');
  // Set the currentRound to 0, and start the game
  guild.gameStart();
}

export const nextRoundStartCountdown = (guild: GuildContext, timeToStart: number) => {
  const channel: AnyChannel = client.channels.cache.get(guild.getChannelId()) as TextChannel;
  simpleMessageEmbed(guild, channel, `Next round starting in **${timeToStart} seconds**.`);
}