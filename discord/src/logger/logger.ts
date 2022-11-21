import { MessageEmbed, MessageEmbedOptions, TextChannel, } from "discord.js";
import client from "../../client";

const makeDescription = (_guildId: string, content?: string) => {
  const guild = client.guilds.cache.get(_guildId);
  return `
**Guild Name:** ${guild.name}
**Guild Id:** ${guild.id}
**Timestamp:** <t:${Math.floor(Date.now() / 1000)}>

${content || ''}
`}

class Logger {
  /**
   * Channel IDthat we want to log to.
   * Note: Only used for Rumble Raffle logs at this time.
   */
  private channelId: string;
  /**
   * Guild ID that we want to log to.
   * Note: Only used for Rumble Raffle logs at this time.
   */
  private guildId: string;

  constructor({ channelId, guildId }) {
    this.channelId = channelId
    this.guildId = guildId
  }

  sendMessage(options: MessageEmbedOptions) {
    try {
      const message = new MessageEmbed(options);
      (client.channels.cache.get(this.channelId) as TextChannel).send({ embeds: [message] });
    } catch (err) {
      console.error(err)
    }
  }

  success(title: string, _guildId: string, messageContent?: string): void {
    this.sendMessage({
      color: 'GREEN',
      description: makeDescription(_guildId, messageContent),
      title: `Sucess: ${title}`,
    });
  }

  error(title: string, _guildId: string, messageContent?: string): void {
    this.sendMessage({
      color: 'RED',
      description: makeDescription(_guildId, messageContent),
      title: `Error: ${title}`
    });
  }
}



export default Logger;