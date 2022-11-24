import { CommandInteraction, CacheType, MessageButton, MessageActionRow } from "discord.js";
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

  const buttonLabel = 'Submit Suggestion'
  const button = new MessageButton()
    .setLabel(buttonLabel)
    .setStyle('LINK')
    .setURL(url)

  const row = new MessageActionRow().addComponents(button)
  interaction.reply({
    ephemeral: true,
    content: `
Click the '${buttonLabel}' button below to add an activity suggestion to the Rumble Raffle ecosystem!

Activities will start to show up once they have been approved for use.

*Why do we need to authorize? What data will be used?*
- \`user_id\`: To link the suggested activity to your account.
- \`guild_id\`: To link the suggested activity to the specific guild.
`,
    components: [row]
  })
}