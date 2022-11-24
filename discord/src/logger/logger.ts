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

/**
 * The logger creates an easy way to send a message to the specified Guild / Channel Id combo.
 * 
 * All messages will include the Guild Name, Guild Id, Timestamp, and optional Message Content
 */
class Logger {
  /**
   * Channel ID that we want to log to.
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

  private sendMessage(options: MessageEmbedOptions) {
    try {
      const message = new MessageEmbed(options);
      (client.channels.cache.get(this.channelId) as TextChannel).send({ embeds: [message] });
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Send a success message to the loggers selected Guild channel.
   * @param title - Title to be added for the message. 'Success: ' is prepended to the title.
   * @param messageContent - Extra message content that will be appended to the message.
   */
  success(title: string, messageContent?: string): void {
    this.sendMessage({
      color: 'GREEN',
      description: makeDescription(this.guildId, messageContent),
      title: `Sucess: ${title}`,
    });
  }

  /**
   * Send an error message to the loggers selected Guild channel.
   * @param title - Title to be added for the message. 'Error: ' is prepended to the title.
   * @param messageContent - Extra message content that will be appended to the message.
   */
  error(title: string, messageContent?: string): void {
    this.sendMessage({
      color: 'RED',
      description: makeDescription(this.guildId, messageContent),
      title: `Error: ${title}`
    });
  }
}



export default Logger;