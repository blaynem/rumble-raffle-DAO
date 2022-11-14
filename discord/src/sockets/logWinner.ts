import { EntireGameLog } from "@rumble-raffle-dao/types";
import { AnyChannel, TextChannel, MessageEmbed } from "discord.js";
import client from "../../client";
import { tagUser } from "../../utils";
import { GuildContext } from "../guildContext";

export const logWinner = async (guild: GuildContext, winners: EntireGameLog['winners']) => {
  if (!guild.gameStarted) {
    return;
  }

  // If they signed up on the website, then they might not have 
  const winnerData = winners.map(winner => ({
    ...winner,
    name: ('discord_id' in winner) ? winner.name : winner.username,
    discord_id: ('discord_id' in winner) ? winner.discord_id : null
  }))

  const channel: AnyChannel = client.channels.cache.get(guild.channelId) as TextChannel;
  const embed = new MessageEmbed()
    .setColor('#9912B8')
    .setTitle(`**WINNER**`)
    .setDescription(`
Congratulations! 1st place goes to **${winnerData[0]?.discord_id ? tagUser(winnerData[0].discord_id) : winnerData[0].name}**.

2nd place **${winnerData[1]?.discord_id ? tagUser(winnerData[1].discord_id) : winnerData[1].name}**.
3rd place **${winnerData[2]?.discord_id ? tagUser(winnerData[2].discord_id) : winnerData[2].name}**.`)
    .setFooter({ text: guild.currentParamsId ? guild.currentParamsId : '' })

  // Set the currentMessage to this message.
  channel.send({
    embeds: [embed]
  })
  // End the games.
  guild.setGameStarted(false);
  guild.setCurrentRound(null)
}