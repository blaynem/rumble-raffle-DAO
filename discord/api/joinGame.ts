import { AuthDiscordInitBody, AuthDiscordInitPostResponse, UserDataFetchByDiscordId } from "@rumble-raffle-dao/types";
import { SERVER_BASE_PATH, SERVER_USERS, JOIN_GAME, PATH_VERIFY_INIT, SERVER_AUTH_DISCORD } from "@rumble-raffle-dao/types/constants";
import { ButtonInteraction, CacheType, MessageEmbed, MessageButton, MessageActionRow } from "discord.js";
import { CONFIG } from "../config";
import { BASE_API_URL } from "../constants";
import { socket } from "../sockets";

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
 * When the user presses the "Join Game" button, this function will fire.
 * 
 * @param interaction - Discords ButtonInteraction type
 */
export const onJoinGamePressed = async (interaction: ButtonInteraction<CacheType>) => {
  const fetchBody: AuthDiscordInitBody = {
    discord_id: interaction.user.id,
    discord_tag: `${interaction.user.username}#${interaction.user.discriminator}`
  };

  // Check if the users discord_id is attached to a users public_address.
  const userFetch: UserDataFetchByDiscordId = await fetch(`${BASE_API_URL}${SERVER_BASE_PATH}${SERVER_USERS}?discord_id=${fetchBody.discord_id}`)
    .then(res => res.json());

  // If the user fetch comes back with a discord_id
  if (userFetch?.discord_id) {
    // join the game through the discord sockets.
    socket.emit(JOIN_GAME, userFetch, CONFIG.roomSlug);
    // Return a reply that we joined the game.
    await interaction.reply({
      ephemeral: true,
      content: 'You have joined the game.'
    });
    return;
  }

  // Otherwise we start the verification init
  const { data: verifyInitData, error } = await fetchVerifyInit(fetchBody);

  if (error) {
    await interaction.reply({
      content: 'There was an error when attempting to join the game, please let the devs know.',
      ephemeral: true,
    });
  }

  // todo: Check if they are linked, if so we should either: 1. join the game for them or 2. tell them "already joined"
  const embed = new MessageEmbed()
    .setColor('#4CE3B6')
    .setTitle('Visit Rumble Raffle site to verify!')
    .setDescription(`
The easiest way to play Rumble Raffle through Discord is by clicking the button below and linking your account. This allows a single button press to join game in the future!

If you would prefer to not link your account, you can join via the site instead [RumbleRaffle.com](${CONFIG.gameUrl}).

***Important: Do not share this link.*** *It is unique to your discord_id*
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