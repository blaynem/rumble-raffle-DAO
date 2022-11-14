require('dotenv').config()
import http from "http";
import { initSockets } from "./src/sockets";
import client from './client';
import { guildConfigs } from './config';
import { getButtonInteraction, getCommandInteraction } from './src';
import { AllGuildContexts } from "./src/guildContext";

const token = process.env.DISCORD_TOKEN
const port = process.env.PORT || 0;

const allGuildContexts = new AllGuildContexts();

http.createServer().listen(port)


// When the client is ready, run this code (only once)
client.once('ready', async () => {
  // Fetches all the members to add to the cache.
  await Promise.all(guildConfigs.map(async guild => {
    // Add guild to all guild contexts
    allGuildContexts.addGuild(guild)
    // fetch the members info
    await client.guilds.cache.get(guild.guildId).members.fetch();
  }))
  initSockets(allGuildContexts, guildConfigs.map(guild => guild.slug));
  console.log('Ready!');
});

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

  const guildContext = allGuildContexts.getGuild(interaction.guildId);
  getCommandInteraction(interaction, guildContext);
});

// Login to Discord with your client's token
client.login(token);
