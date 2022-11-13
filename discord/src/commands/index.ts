import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction } from 'discord.js';
import { GuildContext } from '../guildContext';
import { createGame } from './createGame';
import { startGame } from './start';
import { unlinkAccount } from './unlink';

type Command = {
  /**
   * Callback to be fired 
   */
  callback: (interaction: CommandInteraction<CacheType>, guildContext: GuildContext) => void;
  /**
   * Name of the command
   * 
   * Note: Maps directly to SlashCommandBuilder.setName
   */
  commandName: string;
  /**
   * Description of command.
   * 
   * Note: Maps directly to SlashCommandBuilder.setDescription
   */
  description: string;
}

export const interactionCommands: Command[] = [
  {
    callback: (interaction) => unlinkAccount(interaction),
    commandName: 'unlink',
    description: 'Unlinks your discord_id from Rumble Raffle database.',
  },
  {
    callback: (interaction, guildContext) => createGame(interaction, guildContext),
    commandName: 'create',
    description: 'Create a new Rumble Raffle game with default parameters. (PVE: 30%, Revive: 7%)',
  },
  {
    callback: (interaction, guildContext) => startGame(interaction, guildContext),
    commandName: 'start',
    description: 'Starts the Rumble Raffle game.',
  },
]

/**
 * Finds the command that was called, and fires it.
 * 
 * @param interaction - the Command Interaction from the client
 */
export const getCommandInteraction = (interaction: CommandInteraction<CacheType>, guildContext: GuildContext) => {
  const command = interactionCommands.find(cmd => cmd.commandName === interaction.commandName);
  if (command) {
    command.callback(interaction, guildContext);
  }
}

const mapCommandToBuilder = (cmd) => new SlashCommandBuilder().setName(cmd.commandName).setDescription(cmd.description)

/**
 * These are all of the available slash commands.
 */
export const availableSlashCommands = interactionCommands
  .map(mapCommandToBuilder)
  .map(command => command.toJSON());