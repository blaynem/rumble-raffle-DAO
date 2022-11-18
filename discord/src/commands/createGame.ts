import fetch from 'node-fetch';
import { CreateRoom, CreateRoomRequestBody, RoomDataType } from "@rumble-raffle-dao/types";
import { SERVER_BASE_PATH, SERVER_ROOMS } from "@rumble-raffle-dao/types/constants";
import { CacheType, CommandInteraction, GuildMemberRoleManager } from "discord.js";
import { CONFIG } from "../../config";
import { BASE_API_URL } from "../../constants";
import { GuildContext } from "../guildContext";

// todo:
// - Allow params for pve chance, revive chance? (meh)
export const createGame = async (interaction: CommandInteraction<CacheType>, guildContext: GuildContext) => {
  try {

    // If there is a currentMessage, then we assume there is a game started / in progress.
    if (guildContext.getCurrentMessage()) {
      interaction.reply({ ephemeral: true, content: `Game already in progress <${guildContext.getCurrentMessage().url}>.` })
      return
    }

    // Set the channel we are going to be responding to now.
    guildContext.setChannelId(interaction.channelId)

    const fetchBody: CreateRoomRequestBody = {
      discord_secret: CONFIG.discord_secret,
      discord_id: interaction.member.user.id,
      slug: guildContext.getSlug(),
      contract_address: '0xE7F934c08F64413b98cAb9a5bAFEb1b21FCf2049', // this is Rumble Raffle contract
      params: {
        pve_chance: interaction.options.get('pve_chance')?.value as number || 30,
        revive_chance: interaction.options.get('revive_chance')?.value as number || 7
      }
    }

    const { error }: { data: RoomDataType; error?: string; } = await fetch(`${BASE_API_URL}${SERVER_BASE_PATH}${SERVER_ROOMS}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fetchBody)
    }).then(res => res.json());
    if (error) {
      interaction.reply({ ephemeral: true, content: error })
      return;
    }
    // If it succeeds, it will send a "New Game Created" message via sockets
    interaction.reply({ ephemeral: true, content: 'New game created.' })
  } catch (err) {
    console.error(err)
    interaction.reply({ ephemeral: true, content: "Ope. Something went wrong." })
  }
}
