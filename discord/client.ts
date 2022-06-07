// Require the necessary discord.js classes
import { Client, Intents } from 'discord.js';
// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

export default client;