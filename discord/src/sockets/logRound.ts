import { DiscordPlayer, PickFromPlayers, RoundActivityLog, SingleActivity } from "@rumble-raffle-dao/types";
import { AnyChannel, TextChannel, MessageEmbed } from "discord.js";
import client from "../../client";
import { GuildContext } from "../guildContext";

const getActivityIcon = (environment: string) => {
  if (environment === 'REVIVE') {
    return '🚑'
  }
  if (environment === 'PVE') {
    return '🤼'
  }
  return '⚔';
}

const replaceActivityDescPlaceholders = (activity: SingleActivity): string => {
  const matchPlayerNumber = /(PLAYER_\d+)/ // matches PLAYER_0, PLAYER_12, etc
  const parts = activity.description.split(matchPlayerNumber);

  const replaceNames = parts.map((part, i) => {
    if (part.match(matchPlayerNumber)) {
      const index = Number(part.replace('PLAYER_', ''))
      // Gets the name of the player.
      const player = activity.participants[index]
      return `**${(player as PickFromPlayers)?.name || (player as DiscordPlayer)?.username}**`
    }
    return part;
  })
  return replaceNames.join('')
}

export const logRound = (guild: GuildContext, rounds: RoundActivityLog[]) => {
  const channel: AnyChannel = client.channels.cache.get(guild.getChannelId()) as TextChannel;
  if (guild.getGameStarted()) {
    const round = rounds[guild.getCurrentRound()];

    const getAllActivityDesc = round.activities?.map(activity => ({
      environment: activity.environment,
      description: replaceActivityDescPlaceholders(activity)
    }))

    const description = getAllActivityDesc.map(d => `${getActivityIcon(d.environment)} | ${d.description}`);
    const embed = new MessageEmbed()
      .setColor('#9912B8')
      .setTitle(`**Round ${round.round_counter + 1}**`)
      .setDescription(`
      ${description.join('\n')}
  
      Players left: ${round.players_remaining}`)

    // Set the currentMessage to this message.
    channel.send({ embeds: [embed] })
    guild.setCurrentRound(guild.getCurrentRound() + 1)
  }
}