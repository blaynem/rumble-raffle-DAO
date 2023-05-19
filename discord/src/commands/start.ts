import fetch from 'node-fetch'
import { StartRoomDiscordFetchBody } from '@rumble-raffle-dao/types'
import { SERVER_BASE_PATH, SERVER_ROOMS } from '@rumble-raffle-dao/types/constants'
import { CommandInteraction, CacheType } from 'discord.js'
import { CONFIG } from '../../config'
import { BASE_API_URL } from '../../constants'
import { GuildContext } from '../guildContext'
import { rumbleLogger } from '../logger'

/**
 *
 */
export const startGame = async (
  interaction: CommandInteraction<CacheType>,
  guildContext: GuildContext
) => {
  try {
    const currentMessage = guildContext.getCurrentMessage()
    // If game is started, don't staat another one.
    if (!currentMessage) {
      interaction.reply({ ephemeral: true, content: `Please create a game before starting.` })
      return
    }
    if (guildContext.getGameStarted()) {
      interaction.reply({
        ephemeral: true,
        content: `Game already in progress <${currentMessage.url}>.`
      })
      return
    }
    // Get all users who reacted
    const reaction = currentMessage.reactions.cache.get('⚔')
    if (!reaction) {
      interaction.reply({ ephemeral: true, content: 'No one has reacted to the game yet.' })
      return
    }

    const usersReacted = await reaction.users.fetch()
    const players = usersReacted
      .filter(({ bot }) => !bot)
      .map(({ id, username }) => ({ id, username }))
    if (players.length < 2) {
      interaction.reply({ ephemeral: true, content: 'At least 2 players required to start.' })
      return
    }

    const fetchBody: StartRoomDiscordFetchBody = {
      discord_id: interaction.member!.user.id,
      roomSlug: guildContext.getSlug(),
      discord_secret: CONFIG.discord_secret,
      players
    }
    const { data, error }: { data: string; error?: string } = await fetch(
      `${BASE_API_URL}${SERVER_BASE_PATH}${SERVER_ROOMS}/discord_start`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fetchBody)
      }
    ).then(res => res.json())
    // We only need to send a message if it fails.
    // If it succeeds, it will already send a message.
    if (error) {
      rumbleLogger.error('Game Start', guildContext.getGuildId())
      interaction.reply({ ephemeral: true, content: error })
      return
    }
    rumbleLogger.success(
      'Game Started',
      guildContext.getGuildId(),
      `**Player Amount:** ${players.length}`
    )
    interaction.reply('Game started!')
  } catch (err) {
    console.error(err)
    rumbleLogger.error('Game Start', guildContext.getGuildId())
    interaction.reply({ ephemeral: true, content: 'Ope. Something went wrong.' })
  }
}
