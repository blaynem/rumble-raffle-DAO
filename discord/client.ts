// Require the necessary discord.js classes
import { Client, Intents } from 'discord.js';
// Create a new client instance
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ],
  partials: [
    'MESSAGE', 'CHANNEL', 'REACTION'
  ]
});

export default client;