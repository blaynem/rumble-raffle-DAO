require('dotenv').config()
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { APP_ID, DISCORD_TOKEN, RUMBLE_RAFFLE_GUILD_ID, } from './constants';
import { availableSlashCommands } from './src';

const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);

const deployGlobalProdCommands = async () => {
  await rest.put(Routes.applicationCommands(APP_ID), { body: availableSlashCommands })
}

const deployTestCommands = async (guildId: string) => {
  await rest.put(Routes.applicationGuildCommands(APP_ID, guildId), { body: availableSlashCommands })
}

if (process.env.NODE_ENV === 'production') {
  deployGlobalProdCommands();
  console.log('--Deployed commands globally.');
} else {
  deployTestCommands(RUMBLE_RAFFLE_GUILD_ID)
  console.log('--Deployed commands to test ');
}