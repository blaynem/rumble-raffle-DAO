import { SyncPlayersResponseType } from '@rumble-raffle-dao/types'
import { TextChannel } from 'discord.js'
import client from '../../client'
import { GuildContext } from '../guildContext'
import { createAndSendCurrentPlayerEmbed } from './newGameCreated'
import { rumbleLogger } from '../logger'

/**
 * Useful to sync the player room data to discord if it's been awhile since the last CURRENT ENTRANTS message.
 */
export const syncPlayerRoomData = (
  guild: GuildContext,
  { data, paramsId, error }: SyncPlayersResponseType,
  slug: string
) => {
  const channel = client.channels.cache.get(guild.getChannelId()) as TextChannel

  if (error) {
    channel.send(error)
    return
  }

  if (!paramsId) {
    channel.send(`There was an error attempting to sync player room data.`)
    rumbleLogger.error(
      'There was an error attempting to sync player room data.',
      guild.getGuildId(),
      `**Params Id:** ${paramsId} **Slug:** ${slug}`
    )
    return
  }

  // Create and send the current player embed message.
  createAndSendCurrentPlayerEmbed(guild, channel, paramsId)
}
