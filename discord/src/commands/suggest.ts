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

**3 Easy Steps**
1. Approve the Authorize request.
2. On approval, you'll be redirected to the Rumble Raffle site.
3. Fill out the form and click "submit". Done!

Activities will start to show up once they have been approved for use.

*What data is used and why?*
- \`user_id\`: To link the suggested activity to your account.
- \`guild_id\`: To link the suggested activity to the specific guild.
`,
    components: [row]
  })
}