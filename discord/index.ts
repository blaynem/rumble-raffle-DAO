require('dotenv').config()
import http from "http";
import fetch from 'node-fetch';
import { SERVER_BASE_PATH, SERVER_ROOMS } from '@rumble-raffle-dao/types/constants';
import { fetchPlayerRoomData, initSockets, JOIN_GAME_BUTTON_ID, UNLINK_DISCORD_BUTTON_ID } from "./sockets";
import client from './client';
import { BASE_API_URL } from './constants';
import { interactionCommands } from './deploy-commands';
import { GuildMember, GuildMemberRoleManager, MessageActionRow, MessageButton } from 'discord.js';
import { CreateRoom } from '@rumble-raffle-dao/types';
import { CONFIG } from './config';
import { onJoinGamePressed, onUnlinkDiscord } from "./api";

const token = process.env.DISCORD_TOKEN

const port = process.env.PORT || 0;

http.createServer().listen(port)

const ADMINS = ['197743775177506816']

// When the client is ready, run this code (only once)
client.once('ready', async () => {
  console.log('Ready!');

  // Fetches all the members to add to the cache.
  await client.guilds.cache.get(CONFIG.guildId).members.fetch()

  initSockets();
});

/**
 * These are more so `admin` commands than the `interactionCommands`.
 * 
 * Note: Why `/help`?
 * The only way to do an ephemeral (hidden) message is through the `interactionCommands`.
 * And since we want to limit what commands are shown to a user, we need to use those methods.
 */
const commandInitializer = '!'
const commands = {
  SYNC: {
    adminOnly: true,
    commandName: 'sync',
    description: 'Attempts to sync with the server player data. **Note**: Admin only.',
  },
  START_GAME: {
    adminOnly: true,
    commandName: 'start',
    description: 'Starts the Rumble Raffle game. **Note**: Admin only.',
  },
  CREATE_GAME: {
    adminOnly: true,
    commandName: 'create',
    description: 'Create a new Rumble Raffle game with default parameters. (PVE: 30%, Revive: 7%) **Note**: Admin only.',
  },
}

client.on('messageCreate', async message => {
  // If the message doesn't start with the initiailizer, example `!`, then we don't care.
  if (message.content.startsWith(commandInitializer)) {
    // If the messages channelId doesn't match the designated options channel, we don't send a message.
    if (message.channelId !== CONFIG.channelId) return;
    // If user is not a discord admin, we don't let them send a command.
    const isDiscordAdmin = message.member.roles.cache.has(CONFIG.adminRoleId);
    if (!isDiscordAdmin) return;

    // SYNC GAME DATA
    if (message.content === `${commandInitializer}${commands.SYNC.commandName}`) {
      fetchPlayerRoomData(CONFIG.roomSlug);
      message.reply('Game data syncing.');
      return;
    }

    // START GAME
    if (message.content === `${commandInitializer}${commands.START_GAME.commandName}`) {
      const fetchBody = { discord_id: message.author.id, roomSlug: CONFIG.roomSlug, discord_secret: CONFIG.discord_secret }
      const { data, error }: { data: string; error?: string; } = await fetch(`${BASE_API_URL}${SERVER_BASE_PATH}${SERVER_ROOMS}/discord_start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fetchBody)
      }).then(res => res.json());
      // We only need to send a message if it fails.
      // If it succeeds, it will already send a message.
      if (error) {
        message.reply(error)
      }
      return;
    }

    // CREATE GAME
    if (message.content === `${commandInitializer}${commands.CREATE_GAME.commandName}`) {
      const fetchBody: Omit<CreateRoom, 'createdBy'> & { discord_id: string; discord_secret: string; } = {
        discord_secret: CONFIG.discord_secret,
        discord_id: message.author.id,
        slug: CONFIG.roomSlug,
        contract_address: '0xe7f934c08f64413b98cab9a5bafeb1b21fcf2049', // todo: this is sFNC, CHANGE THIS
        params: {
          pve_chance: 30,
          revive_chance: 7
        }
      }
      const { data, error }: { data: string; error?: string; } = await fetch(`${BASE_API_URL}${SERVER_BASE_PATH}${SERVER_ROOMS}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fetchBody)
      }).then(res => res.json());
      // We only need to send a message if it fails.
      // If it succeeds, it will already send a message.
      if (error) {
        message.reply(error)
      }
      return;
    }
  }
});

/**
 * BUTTON - Interactions
 */
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  // On 'Join Game' button pressed
  if (interaction.customId === JOIN_GAME_BUTTON_ID) {
    onJoinGamePressed(interaction)
  }
  if (interaction.customId === UNLINK_DISCORD_BUTTON_ID) {
    onUnlinkDiscord(interaction)
  }
});

/**
 * COMMAND - Interactions
 */
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === interactionCommands.HELP.commandName) {
    // list all options from the `!commands` 
    // based on if they are an admin level or not
    const availableCommands = Object.values(commands)
      .filter(cmd => {
        // If it's not an adminOnly command, we let it through.
        if (!cmd.adminOnly) return true;
        // For some reason the _roles isn't being found. So typing this as any for now.
        const memberRoles = (interaction.member as any)._roles as string[] || [];
        // Check that the member has admin role
        return memberRoles.includes(CONFIG.adminRoleId);
      })
      .map(cmd => `\`${commandInitializer}${cmd.commandName}\`: ${cmd.description}`)

    if (availableCommands.length < 1) {
      await interaction.reply({
        ephemeral: true,
        content: `Sorry, no commands are available for your role.`
      });
      return;
    }

    await interaction.reply({
      ephemeral: true,
      content: `List of help commands:\n${availableCommands.join('\n')}`
    });
  }
  if (commandName === interactionCommands.UNLINK.commandName) {
    const button = new MessageButton()
      .setCustomId(UNLINK_DISCORD_BUTTON_ID)
      .setLabel('Unlink Discord')
      .setStyle('DANGER');

    const row = new MessageActionRow()
      .addComponents(button);

    interaction.reply({
      ephemeral: true,
      content: 'Are you sure you want to unlink your discord id?',
      components: [row]
    })
  }
});

// Login to Discord with your client's token
client.login(token);
