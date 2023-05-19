import { EntireGameLog } from '@rumble-raffle-dao/types'
import { TextChannel, EmbedBuilder } from 'discord.js'
import client from '../../client'
import { tagUser } from '../../utils'
import { GuildContext } from '../guildContext'
import { rumbleLogger } from '../logger'

export const logWinner = async (guild: GuildContext, winners: EntireGameLog['winners']) => {
  // If they signed up on the website, then they might not have
  const winnerData = winners.map(winner => ({
    ...winner,
    name: 'discord_id' in winner ? winner.name : winner.username,
    discord_id: 'discord_id' in winner ? winner.discord_id : null
  }))

  const winnerMessage = `Congratulations! 1st place goes to **${
    winnerData[0]?.discord_id ? tagUser(winnerData[0].discord_id) : winnerData[0].name
  }**.`
  const secondPlace = `2nd place **${
    winnerData[1]?.discord_id ? tagUser(winnerData[1].discord_id) : winnerData[1].name
  }**.`
  const thirdPlace = winnerData[2]
    ? `3rd place **${
        winnerData[2]?.discord_id ? tagUser(winnerData[2].discord_id) : winnerData[2].name
      }**.`
    : ''

  let paramsId = guild.getCurrentParamsId() || ''
  // This is just to overwrite the free params id
  if (paramsId === 'FREE_PARAMS_ID') {
    paramsId = ''
  }

  const channel = client.channels.cache.get(guild.getChannelId()) as TextChannel
  const embed = new EmbedBuilder()
    .setColor('#9912B8')
    .setTitle(`**WINNER**`)
    .setDescription(
      `
${winnerMessage}

${secondPlace}
${thirdPlace}`
    )
    .setFooter({ text: paramsId })

  // Set the currentMessage to this message.
  channel.send({
    embeds: [embed]
  })
  // End the games.
  guild.resetGame()
  rumbleLogger.success('Game Complete', guild.getGuildId(), `**Params Id:** ${paramsId}`)
}
