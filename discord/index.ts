require('dotenv').config()
import { DEFAULT_GAME_ROOM } from '@rumble-raffle-dao/types/constants';
import { fetchPlayerRoomData, initSockets } from "./sockets";
import client from './client';
import { BASE_WEB_URL } from './constants';
import { getUserFromUserTag } from './utils';

const token = process.env.DISCORD_TOKEN

const RUMBLE_CHANNEL_ID = '983207646821777489';
const TEST_RUMBLE_CHANNEL_ID = '984191202112987186';

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
}

export const options: Options = {
  channelId: TEST_RUMBLE_CHANNEL_ID,
  roomSlug: DEFAULT_GAME_ROOM,
  gameUrl: `${BASE_WEB_URL}/play`
}


// When the client is ready, run this code (only once)
client.once('ready', async () => {
  console.log('Ready!');

  // Fetches all the members to add to the cache.
  await client.guilds.cache.get(process.env.GUILD_ID).members.fetch()
  
  initSockets();
});


client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  // todo: Block anyone who isn't an admin from doing

  const { commandName } = interaction;

  if (commandName === 'syncgame') {
    // Syncing current player data to discord
    await interaction.reply('Game data synced.');
    fetchPlayerRoomData(options.roomSlug);
  } else if (commandName === 'start') {
    
    await interaction.reply(`<@${getUserFromUserTag('Blaynem#5926')?.id}>`)
    await interaction.reply({ ephemeral: true, content: 'Not implemented yet.'});
  } else if (commandName === 'create') {
    await interaction.reply({ ephemeral: true, content: 'Not implemented yet.'});
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