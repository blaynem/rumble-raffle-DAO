require('dotenv').config()
import { DEFAULT_GAME_ROOM } from '@rumble-raffle-dao/types/constants';
import { fetchPlayerRoomData, initSockets } from "./sockets";
import client from './client';
import { BASE_WEB_URL } from './constants';
import { interactionCommands } from './deploy-commands';
import { MessageEmbed } from 'discord.js';

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


client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  // todo: Block anyone who isn't an admin from doing

  const { commandName } = interaction;

  // If `JOIN` command is used.
  if (commandName === interactionCommands.JOIN.commandName) {
    const embed = new MessageEmbed()
      .setColor('#4CE3B6')
      .setTitle('Visit RumbleRaffle site to battle!')
      .setURL(options.gameUrl)
      .setDescription(`
Currently the only way to join a game is by visiting the Rumble Raffle site itself.

It's as simple as **1-2-3**.
1. Connect your metamask and sign the message, proving you own the account.
2. Visit the "Play" tab
3. Click "Join Game"
  `)
    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  } else if (commandName === interactionCommands.HELP.commandName) {
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

// Login to Discord with your client's token
client.login(token);


// const showButtonExample = async (interaction: CommandInteraction) => {
//   const row = new MessageActionRow()
//     .addComponents(
//       new MessageButton()
//         .setCustomId('primary')
//         .setLabel('Primary')
//         .setStyle('PRIMARY'),
//     );
//   const embed = new MessageEmbed()
//     .setColor('#0099ff')
//     .setTitle('Some title')
//     .setURL('https://discord.js.org')
//     .setDescription('Some description here');

//   await interaction.reply({ content: 'Pong!', ephemeral: true, embeds: [embed], components: [row] });
// }