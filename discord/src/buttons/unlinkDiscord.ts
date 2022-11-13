import { AuthDiscordVerifyPostResponse } from "@rumble-raffle-dao/types";
import { SERVER_BASE_PATH, SERVER_AUTH_DISCORD, PATH_UNLINK_DISCORD } from "@rumble-raffle-dao/types/constants";
import { ButtonInteraction, CacheType } from "discord.js";
import { BASE_API_URL } from "../../constants";
import fetch from "node-fetch";

export const unlinkDiscord = async (interaction: ButtonInteraction<CacheType>) => {
  const { data, error } = await fetch(`${BASE_API_URL}${SERVER_BASE_PATH}${SERVER_AUTH_DISCORD}${PATH_UNLINK_DISCORD}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ discord_id: interaction.user.id })
  }).then(res => res.json()) as AuthDiscordVerifyPostResponse
  if (error) {
    interaction.update({ content: 'Please let the admins know there was an error.', components: [] });
    return;
  }
  interaction.update({ content: data, components: [] });
}