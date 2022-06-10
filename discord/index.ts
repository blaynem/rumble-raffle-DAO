require('dotenv').config()
import fetch from 'node-fetch';
import { DEFAULT_GAME_ROOM, PATH_VERIFY_INIT, SERVER_AUTH_DISCORD, SERVER_BASE_PATH } from '@rumble-raffle-dao/types/constants';
import { fetchPlayerRoomData, initSockets, JOIN_GAME_BUTTON_ID } from "./sockets";
import client from './client';
import { BASE_API_URL, BASE_WEB_URL } from './constants';
import { interactionCommands } from './deploy-commands';
import { ButtonInteraction, CacheType, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { AuthDiscordInitBody, AuthDiscordInitPostResponse } from '@rumble-raffle-dao/types';

const token = process.env.DISCORD_TOKEN

const RUMBLE_CHANNEL_ID = '984225124582580305';
const TEST_RUMBLE_CHANNEL_ID = '984191202112987186';

const ADMINS = ['197743775177506816']

interface Options {
  /**
   * Id of discord channel that text will be sent to.
   */
  channelId: string;
  /**
   * Room name in the database we want to listen to.
   */
  roomSlug: string;
  /**
   * The URL for the played games.
   */
  gameUrl: string;
  /**
   * The discord guild id we want to act on
   */
  guildId: string;
}

export const options: Options = {
  channelId: TEST_RUMBLE_CHANNEL_ID,
  roomSlug: DEFAULT_GAME_ROOM,
  gameUrl: `${BASE_WEB_URL}/play`,
  guildId: process.env.GUILD_ID
}


// When the client is ready, run this code (only once)
client.once('ready', async () => {
  console.log('Ready!');

  // Fetches all the members to add to the cache.
  await client.guilds.cache.get(options.guildId).members.fetch()

  initSockets();
});

/**
 * These are more so `admin` commands than the `interactionCommands`.
 * 
 * Note: Why `/help`?
 * The only way to do an ephemeral (hidden) message is through the `interactionCommands`.
 * And since we want to limit what commands are shown to a user, we need to use those methods.
 */
const commandInitializer = '!'
const commands = {
  SYNC: {
    adminOnly: true,
    commandName: 'sync',
    description: 'Attempts to sync with the server player data. **Note**: Admin only.',
  },
}

// Only do these commands if it's based on certain channels. (We'll have both a test / prod bot in the future)
client.on('messageCreate', async message => {
  if (message.content.startsWith(commandInitializer)) {
    if (message.content === `${commandInitializer}${commands.SYNC.commandName}`) {
      fetchPlayerRoomData(options.roomSlug);
      message.reply('Game data syncing.');
      return;
    }
  }
});

/**
 * BUTTON - Interactions
 */
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  // On 'Join Game' button pressed
  if (interaction.customId === JOIN_GAME_BUTTON_ID) {
    onJoinGamePressed(interaction)
  }
});

/**
 * COMMAND - Interactions
 */
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  // todo: Block anyone who isn't an admin from doing

  const { commandName } = interaction;

  if (commandName === interactionCommands.HELP.commandName) {
    // list all options from the `!commands` 
    // based on if they are an admin level or not
    const availableCommands = Object.values(commands)
      .filter(cmd => {
        // If it's not an adminOnly command, we let it through.
        if (!cmd.adminOnly) return true;
        // TODO: this should be filtered by role instead of a list of admins.
        return ADMINS.includes(interaction.user.id);
      })
      .map(cmd => `\`${commandInitializer}${cmd.commandName}\`: ${cmd.description}`)

    if (availableCommands.length < 1) {
      await interaction.reply({
        ephemeral: true,
        content: `Sorry, no commands are available for your role.`
      });
      return;
    }

    await interaction.reply({
      ephemeral: true,
      content: `List of help commands:\n${availableCommands.join('\n')}`
    });
  }
});

/**
 * When the user presses the "Join Game" button, this function will fire.
 * 
 * @param interaction - Discords ButtonInteraction type
 */
const onJoinGamePressed = async (interaction: ButtonInteraction<CacheType>) => {
  const fetchBody: AuthDiscordInitBody = {
    discord_id: interaction.user.id,
  };
  const { data: verifyInitData, error } = await fetch(`${BASE_API_URL}${SERVER_BASE_PATH}${SERVER_AUTH_DISCORD}${PATH_VERIFY_INIT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(fetchBody)
  }).then(res => res.json()) as AuthDiscordInitPostResponse

  if (error) {
    await interaction.reply({
      content: 'There was an error when attempting to join the game, please let the devs know.',
      ephemeral: true,
    });
  }

  // todo: Check if they are linked, if so we should either: 1. join the game for them or 2. tell them "already joined"
  const embed = new MessageEmbed()
    .setColor('#4CE3B6')
    .setTitle('Visit Rumble Raffle site to battle!')
    .setDescription(`
If you would like to link your discord to Rumble Raffle, click the 'Link Discord' button below.

If you do not want to link accounts, it's as simple as **1-2-3**.
1. Click to visit [RumbleRaffle.com](${options.gameUrl}).
2. Connect your metamask and sign the message, proving you own the account.
3. Click "Join Game"
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

// Login to Discord with your client's token
client.login(token);
