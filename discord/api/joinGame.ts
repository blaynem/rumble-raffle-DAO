import fetch from 'node-fetch';
import { AuthDiscordInitBody, AuthDiscordInitPostResponse, UserDataFetchByDiscordId } from "@rumble-raffle-dao/types";
import { SERVER_BASE_PATH, SERVER_USERS, PATH_VERIFY_INIT, SERVER_AUTH_DISCORD, LOGIN_MESSAGE } from "@rumble-raffle-dao/types/constants";
import { ButtonInteraction, CacheType, MessageEmbed, MessageButton, MessageActionRow } from "discord.js";
import { CONFIG } from "../config";
import { BASE_API_URL } from "../constants";
import { JOIN_GAME_EMOJI } from '../sockets';

/**
 * Does the Discord Auth verification fetch
 */
const fetchVerifyInit = async (fetchBody: AuthDiscordInitBody) => {
  return await fetch(`${BASE_API_URL}${SERVER_BASE_PATH}${SERVER_AUTH_DISCORD}${PATH_VERIFY_INIT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(fetchBody)
  }).then(res => res.json()) as AuthDiscordInitPostResponse
}

/**
 * When the user presses the "Verify" button, this function will fire.
 * 
 * @param interaction - Discords ButtonInteraction type
 */
export const onVerifyAccountPressed = async (interaction: ButtonInteraction<CacheType>) => {
  const fetchBody: AuthDiscordInitBody = {
    discord_id: interaction.user.id,
    discord_tag: `${interaction.user.username}#${interaction.user.discriminator}`
  };

  // Check if the users discord_id is attached to a users public_address.
  const user: UserDataFetchByDiscordId = await fetch(`${BASE_API_URL}${SERVER_BASE_PATH}${SERVER_USERS}?discord_id=${fetchBody.discord_id}`)
    .then(res => res.json());

  // If the user fetch comes back with a discord_id
  if (user?.discord_id) {
    // Return a reply that we joined the game.
    await interaction.reply({
      ephemeral: true,
      content: `Looks like you're already verified! Click the ${JOIN_GAME_EMOJI} to join the game.`
    });
    return;
  }

  // Otherwise we start the verification init
  const { data: verifyInitData, error } = await fetchVerifyInit(fetchBody);

  if (error) {
    await interaction.reply({
      content: 'There was an error when creating a verification code, please let the devs know.',
      ephemeral: true,
    });
  }

  const embed = new MessageEmbed()
    .setColor('#4CE3B6')
    .setTitle('Visit Rumble Raffle site to verify!')
    .setDescription(`
In order to save your progress and earn tokens, you'll need to verify your crypto wallet on the Rumble Raffle site.

**Verification Steps**

1. Click "Link Discord" button below. This will bring you to the Rumble Raffle verify page. ***Important: Do not share this link.*** *It is unique to your discord_id*
2. Connect Metamask wallet and sign the message "${LOGIN_MESSAGE}"
3. Confirm you see the correct discord id on the page, then click "Verify Me" and you'll be prompted to sign another message.
4. Once again confirm you see the correct details and sign the message.
5. All set!

If you would prefer to not link your account, simply dismiss this message and join by clicking the ${JOIN_GAME_EMOJI} emote.

Want to know more?
[RumbleRaffle.com](${CONFIG.siteUrl})
`)

  // Now we set the link
  const linkButton = new MessageButton()
    .setLabel('Link Discord')
    .setURL(verifyInitData.verify_link)
    .setStyle('LINK');

  const row = new MessageActionRow()
    .addComponents(linkButton);

  await interaction.reply({
    embeds: [embed],
    ephemeral: true,
    components: [row]
  });
}