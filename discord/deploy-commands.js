require('dotenv').config()
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
const token = process.env.DISCORD_TOKEN
const appId = process.env.APP_ID
const guildId = process.env.GUILD_ID

export const interactionCommands = {
  HELP: {
    commandName: 'help',
    description: 'Displays all available commands to the user.'
  },
  UNLINK: {
    commandName: 'unlink',
    description: 'Unlinks your discord_id from Rumble Raffle database.'
  }
}

const commands = [
  new SlashCommandBuilder().setName(interactionCommands.HELP.commandName).setDescription(interactionCommands.HELP.description),
  new SlashCommandBuilder().setName(interactionCommands.UNLINK.commandName).setDescription(interactionCommands.UNLINK.description),
]
  .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(appId, guildId), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);