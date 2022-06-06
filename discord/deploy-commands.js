require('dotenv').config()
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
const token = process.env.DISCORD_TOKEN
const appId = process.env.APP_ID
const guildId = process.env.GUILD_ID

const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Replies with "Pong!"'),
	new SlashCommandBuilder().setName('start').setDescription('Starts the rumble game.'),
	new SlashCommandBuilder().setName('create').setDescription('Creates a new rumble game.'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(appId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);