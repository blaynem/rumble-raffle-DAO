import http from 'http'
import { initSockets, emitJoinRoom } from './src/sockets'
import client from './client'
import { getButtonInteraction, getCommandInteraction } from './src'
import { AllGuildContexts } from './src/guildContext'
import { DISCORD_TOKEN } from './constants'
import dotenv from 'dotenv'
dotenv.config()

const port = process.env.PORT || 0

const allGuildContexts = new AllGuildContexts()

http.createServer().listen(port)

// When the client is ready, run this code (only once)
client.once('ready', async () => {
  // Fetches all the members to add to the cache.
  initSockets(allGuildContexts)
  console.log('Ready!')
})

/**
 * BUTTON - Interactions
 */
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return

  getButtonInteraction(interaction)
})

/**
 * COMMAND - Interactions
 */
client.on('interactionCreate', interaction => {
  if (!interaction.isCommand()) return

  const guildId = interaction.guildId
  if (!guildId) return
  let guildContext = allGuildContexts.getGuild(guildId)
  // If we don't have any guild context, then we need to get the bot the data
  if (!guildContext) {
    guildContext = allGuildContexts.addGuild({ guildId })
    emitJoinRoom(guildId)
    client.guilds.cache.get(guildId)!.members.fetch()
  }
  getCommandInteraction(interaction, guildContext!)
})

// Login to Discord with your client's token
client.login(DISCORD_TOKEN)
