import { StartRoomDiscordFetchBody } from "@rumble-raffle-dao/types";
import { SERVER_BASE_PATH, SERVER_ROOMS } from "@rumble-raffle-dao/types/constants";
import { CommandInteraction, CacheType } from "discord.js";
import { CONFIG } from "../../config";
import { BASE_API_URL } from "../../constants";
import { currentMessage } from "../../sockets";

/**
 * TODO
 * - Assure caller a discord admin
 * - get the correct "currentMessage" somehow
 */
export const startGame = async (interaction: CommandInteraction<CacheType>) => {
  // Get all users who reacted
  const reaction = currentMessage.reactions.cache.get('⚔');
  const usersReacted = await reaction.users.fetch()
  const players = usersReacted.filter((({ bot }) => !bot)).map(({ id, username }) => ({ id, username }));

  const fetchBody: StartRoomDiscordFetchBody = { discord_id: interaction.member.user.id, roomSlug: CONFIG.roomSlug, discord_secret: CONFIG.discord_secret, players }
  console.log(fetchBody)
  // const { data, error }: { data: string; error?: string; } = await fetch(`${BASE_API_URL}${SERVER_BASE_PATH}${SERVER_ROOMS}/discord_start`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(fetchBody)
  // }).then(res => res.json());
  // // We only need to send a message if it fails.
  // // If it succeeds, it will already send a message.
  // if (error) {
  //   interaction.reply(error)
  // }
  // return;
}