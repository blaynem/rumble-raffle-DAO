import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction } from 'discord.js';
import { createGame } from './createGame';
import { startGame } from './startGame';
import { unlinkAccount } from './unlink';

export const interactionCommands = [
  {
    callback: (interaction: CommandInteraction<CacheType>) => unlinkAccount(interaction),
    commandName: 'unlink',
    description: 'Unlinks your discord_id from Rumble Raffle database.',
  },
  {
    callback: (interaction: CommandInteraction<CacheType>) => createGame(interaction),
    commandName: 'create',
    description: 'Create a new Rumble Raffle game with default parameters. (PVE: 30%, Revive: 7%)',
  },
  {
    callback: (interaction: CommandInteraction<CacheType>) => startGame(interaction),
    commandName: 'start',
    description: 'Starts the Rumble Raffle game.',
  },
]

/**
 * Finds the command that was called, and fires it.
 * 
 * @param interaction - the Command Interaction from the client
 */
export const getCommandInteraction = (interaction: CommandInteraction<CacheType>) => {
  const command = interactionCommands.find(cmd => cmd.commandName === interaction.commandName);
  if (command) {
    command.callback(interaction);
  }
}

const mapCommandToBuilder = (cmd) => new SlashCommandBuilder().setName(cmd.commandName).setDescription(cmd.description)

/**
 * These are all of the available slash commands.
 */
export const availableSlashCommands = interactionCommands
  .map(mapCommandToBuilder)
  .map(command => command.toJSON());