import fetch from 'node-fetch';
import { CreateRoom, RoomDataType } from "@rumble-raffle-dao/types";
import { SERVER_BASE_PATH, SERVER_ROOMS } from "@rumble-raffle-dao/types/constants";
import { CacheType, CommandInteraction, GuildMemberRoleManager } from "discord.js";
import { CONFIG } from "../../config";
import { BASE_API_URL } from "../../constants";
import { GuildContext } from "../guildContext";

// todo:
// - Allow params for pve chance, revive chance? (meh)
export const createGame = async (interaction: CommandInteraction<CacheType>, guildContext: GuildContext) => {
  try {
    const roles = Array.from((interaction.member.roles as GuildMemberRoleManager).cache.keys());
    // If player isn't admin, we don't do anything
    if (!guildContext.isAdmin(roles)) {
      interaction.reply({ ephemeral: true, content: 'Only admins can start a game at this time.' })
      return;
    };

    // TODO: If a game is in progress, don't let them start one.

    // Set the channel we are going to be responding to now.
    guildContext.setChannelId(interaction.channelId)

    const fetchBody: Omit<CreateRoom, 'createdBy'> & { discord_id: string; discord_secret: string; } = {
      discord_secret: CONFIG.discord_secret,
      discord_id: interaction.member.user.id,
      slug: guildContext.slug,
      contract_address: '0xE7F934c08F64413b98cAb9a5bAFEb1b21FCf2049', // this is Rumble Raffle contract
      params: {
        pve_chance: 30,
        revive_chance: 7
      }
    }

    const { error }: { data: RoomDataType; error?: string; } = await fetch(`${BASE_API_URL}${SERVER_BASE_PATH}${SERVER_ROOMS}/create`, {
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
    }
    interaction.reply({ ephemeral: true, content: 'New game created.' })
  } catch (err) {
    console.error(err)
    interaction.reply({ ephemeral: true, content: "Ope. Something went wrong." })
  }
}
