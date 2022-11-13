require('dotenv').config()
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { availableSlashCommands } from './src';
const token = process.env.DISCORD_TOKEN
const appId = process.env.APP_ID
const guildId = process.env.GUILD_ID

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(appId, guildId), { body: availableSlashCommands })
  .then(() => console.log('Successfully registered application slash commands.'))
  .catch(console);