require('dotenv').config()
import http from "http";
import { initSockets } from "./sockets";
import client from './client';
import { CONFIG } from './config';
import { getButtonInteraction, getCommandInteraction } from './src';

const token = process.env.DISCORD_TOKEN

const port = process.env.PORT || 0;

http.createServer().listen(port)


// When the client is ready, run this code (only once)
client.once('ready', async () => {
  console.log('Ready!');

  // Fetches all the members to add to the cache.
  await client.guilds.cache.get(CONFIG.guildId).members.fetch()

  initSockets();
});

// // We don't have anything for message watching for now.
// client.on('messageCreate', async message => {
//   // If the message doesn't start with the initiailizer, example `!`, then we don't care.
//   if (message.content.startsWith(commandInitializer)) {
//     // If the messages channelId doesn't match the designated options channel, we don't send a message.
//     if (message.channelId !== CONFIG.channelId) return;
//     // If user is not a discord admin, we don't let them send a command.
//     const isDiscordAdmin = message.member.roles.cache.has(CONFIG.adminRoleId);
//     if (!isDiscordAdmin) return;

//     // SYNC GAME DATA
//     if (message.content === `${commandInitializer}${commands.SYNC.commandName}`) {
//       fetchPlayerRoomData(CONFIG.roomSlug);
//       message.reply('Game data syncing.');
//       return;
//     }
//   }
// });

/**
 * BUTTON - Interactions
 */
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  getButtonInteraction(interaction);
});

/**
 * COMMAND - Interactions
 */
client.on('interactionCreate', interaction => {
  if (!interaction.isCommand()) return;

  getCommandInteraction(interaction);
});

// Login to Discord with your client's token
client.login(token);
