import { CreateRoom } from "@rumble-raffle-dao/types";
import { SERVER_BASE_PATH, SERVER_ROOMS } from "@rumble-raffle-dao/types/constants";
import { CacheType, CommandInteraction } from "discord.js";
import { CONFIG } from "../../config";
import { BASE_API_URL } from "../../constants";

// todo: Assure they're a discord admin
export const createGame = async (interaction: CommandInteraction<CacheType>) => {
  const fetchBody: Omit<CreateRoom, 'createdBy'> & { discord_id: string; discord_secret: string; } = {
    discord_secret: CONFIG.discord_secret,
    discord_id: interaction.member.user.id,
    slug: CONFIG.roomSlug,
    contract_address: '0xe7f934c08f64413b98cab9a5bafeb1b21fcf2049', // todo: this is sFNC, CHANGE THIS
    params: {
      pve_chance: 30,
      revive_chance: 7
    }
  }
  console.log(fetchBody);
  return;
  // const { data, error }: { data: string; error?: string; } = await fetch(`${BASE_API_URL}${SERVER_BASE_PATH}${SERVER_ROOMS}/create`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(fetchBody)
  // }).then(res => res.json());
  // We only need to send a message if it fails.
  // If it succeeds, it will already send a message.
  // if (error) {
  //   interaction.reply(error)
  // }
}
