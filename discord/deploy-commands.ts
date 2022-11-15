require('dotenv').config()
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { availableSlashCommands } from './src';

const token = process.env.DISCORD_TOKEN
const appId = process.env.APP_ID

const rest = new REST({ version: '9' }).setToken(token);

export const deployGlobalCommands = async () => {
  await rest.put(Routes.applicationCommands(appId), { body: availableSlashCommands })
}

export const deployGuildCommands = async (guildId: string) => {
  await rest.put(Routes.applicationGuildCommands(appId, guildId), { body: availableSlashCommands })
}