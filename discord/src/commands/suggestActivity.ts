import { CommandInteraction, CacheType } from "discord.js";
import { APP_ID, BASE_WEB_URL } from "../../constants";
import { GuildContext } from "../guildContext";

export const suggestedActivity = (interaction: CommandInteraction<CacheType>, guildContext: GuildContext) => {
  const urlState = {
    guild_id: guildContext.getGuildId()
  }
  const urlEncoded = new URLSearchParams({
    client_id: APP_ID,
    redirect_uri: `${BASE_WEB_URL}/suggest`,
    state: JSON.stringify(urlState),
    response_type: "code",
    scope: "identify"
  }).toString();
  const url = `https://discord.com/api/oauth2/authorize?${urlEncoded}`
  interaction.reply({ ephemeral: true, content: url })
}