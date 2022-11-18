import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction } from 'discord.js';
import { GuildContext } from '../guildContext';
import { createGame } from './createGame';
import { startGame } from './start';
import { unlinkAccount } from './unlink';
import { verifyAccount } from './verifyAccount';

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
  /**
   * Additional options that are to be added to the slash command.
   */
  options?: (cmd: SlashCommandBuilder) => Partial<SlashCommandBuilder>;
}

export const verifyAccountCommand: Command = {
  callback: (interaction) => verifyAccount(interaction),
  commandName: 'link',
  description: 'Link your discord_id to the Rumble Raffle database.',
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
    options: cmd => {
      return cmd.addIntegerOption(option =>
        option.setName('pve_chance')
          .setMinValue(0)
          .setMaxValue(50)
          .setDescription('Percent chance of a PVE random. Default: 30.'))
        .addIntegerOption(option =>
          option.setName('revive_chance')
            .setMinValue(0)
            .setMaxValue(10)
            .setDescription('Percent chance of someone to revive. Default: 7'))
    }
  },
  {
    callback: (interaction, guildContext) => startGame(interaction, guildContext),
    commandName: 'start',
    description: 'Starts the Rumble Raffle game.',
  },
  verifyAccountCommand
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


/**
 * These are all of the available slash commands.
 */
export const availableSlashCommands = interactionCommands
  .map((cmd) => {
    const commandBuilder = new SlashCommandBuilder()
      .setName(cmd.commandName)
      .setDescription(cmd.description)
    // If we don't have options we can return it now.
    if (!cmd.options) {
      return commandBuilder;
    }
    // Apply the options if we have m.
    return cmd.options(commandBuilder)
  })
  .map(cmd => cmd.toJSON());