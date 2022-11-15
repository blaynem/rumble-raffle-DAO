import fetch from 'node-fetch';
import { StartRoomDiscordFetchBody } from "@rumble-raffle-dao/types";
import { SERVER_BASE_PATH, SERVER_ROOMS } from "@rumble-raffle-dao/types/constants";
import { CommandInteraction, CacheType } from "discord.js";
import { CONFIG } from "../../config";
import { BASE_API_URL } from "../../constants";
import { GuildContext } from '../guildContext';

/**
 * 
 */
export const startGame = async (interaction: CommandInteraction<CacheType>, guildContext: GuildContext) => {
  try {
    // If game is started, don't staat another one.
    if (!guildContext.getCurrentMessage()) {
      interaction.reply({ ephemeral: true, content: `Please create a game before starting.` })
      return;
    }
    if (guildContext.getGameStarted()) {
      interaction.reply({ ephemeral: true, content: `Game already in progress <${guildContext.getCurrentMessage().url}>.` })
      return;
    }
    // Get all users who reacted
    const reaction = guildContext.getCurrentMessage().reactions.cache.get('⚔');
    const usersReacted = await reaction.users.fetch()
    const players = usersReacted.filter((({ bot }) => !bot)).map(({ id, username }) => ({ id, username }));
    if (players.length <= 2) {
      interaction.reply({ ephemeral: true, content: "At least 2 players required to start." })
      return;
    }

    const fetchBody: StartRoomDiscordFetchBody = {
      discord_id: interaction.member.user.id,
      roomSlug: guildContext.getSlug(),
      discord_secret: CONFIG.discord_secret,
      players
    }
    const { data, error }: { data: string; error?: string; } = await fetch(`${BASE_API_URL}${SERVER_BASE_PATH}${SERVER_ROOMS}/discord_start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fetchBody)
    }).then(res => res.json());
    // We only need to send a message if it fails.
    // If it succeeds, it will already send a message.
    if (error) {
      interaction.reply({ ephemeral: true, content: error })
      return;
    }
    interaction.reply('Game started!');
  } catch (err) {
    console.error(err);
    interaction.reply({ ephemeral: true, content: 'Ope. Something went wrong.' })
  }
}