require('dotenv').config()
import { ServerToClientEvents, ClientToServerEvents, PlayerAndRoomInfoType, SyncPlayersResponseType, RoundActivityLog, SingleActivity, PickFromPlayers } from "@rumble-raffle-dao/types";
import { GAME_START_COUNTDOWN, JOIN_ROOM, NEXT_ROUND_START_COUNTDOWN, SYNC_PLAYERS_REQUEST, SYNC_PLAYERS_RESPONSE, UPDATE_ACTIVITY_LOG_ROUND, UPDATE_ACTIVITY_LOG_WINNER, UPDATE_PLAYER_LIST } from "@rumble-raffle-dao/types/constants";
import { Socket, io } from "socket.io-client";
import { BASE_API_URL } from "../constants";
import { options } from '../index';
import client from "../client";
import { AnyChannel, Message, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";
import { getUserFromUserTag, tagUser } from "../utils";

const botId = process.env.APP_ID;

const CURRENT_ENTRANTS = 'NEXT RUMBLE BEGINS SHORTLY';
export const JOIN_GAME_BUTTON_ID = 'joinGameId';

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(BASE_API_URL);

/**
 * We keep track of the message id that way we can edit the message.
 * 
 * The message should be overwritten any time these functions fire:
 * - createNewGame
 * - syncPlayerRoomData
 */
let currentMessage: Message<boolean> = null;
let currentRound = null;
let gameStarted = false;
let currentParamsId = null;

export const initSockets = () => {
  socket.emit(JOIN_ROOM, options.roomSlug);

  socket.on(SYNC_PLAYERS_RESPONSE, syncPlayerRoomData)
  socket.on(UPDATE_PLAYER_LIST, updatePlayerRoomData);

  socket.on(UPDATE_ACTIVITY_LOG_WINNER, logWinner);
  socket.on(UPDATE_ACTIVITY_LOG_ROUND, logRound);

  socket.on(GAME_START_COUNTDOWN, (timeToStart) => {
    const channel: AnyChannel = client.channels.cache.get(options.channelId) as TextChannel;
    simpleMessageEmbed(channel, `Game starting in **${timeToStart} seconds**.`, 'Prepare for battle!');
    // Set the currentRound to 0, and start the game
    currentRound = 0;
    gameStarted = true;
  });

  socket.on(NEXT_ROUND_START_COUNTDOWN, (timeToStart) => {
    const channel: AnyChannel = client.channels.cache.get(options.channelId) as TextChannel;
    simpleMessageEmbed(channel, `Next round starting in **${timeToStart} seconds**.`);
  });


  socket.on('disconnect', () => {
    console.log('--DISCORD BOT DISCONNECTED--');
    // Rejoin room on disconnect
    socket.emit(JOIN_ROOM, options.roomSlug);
  });
}

export const fetchPlayerRoomData = (roomSlug: string) => {
  // emits the SYNC_PLAYERS_REQUEST
  // then we listen for the socket.on of SYNC_PLAYERS_RESPONSE
  socket.emit(SYNC_PLAYERS_REQUEST, roomSlug)
}

const replaceActivityDescPlaceholders = (activity: SingleActivity): string => {
  const matchPlayerNumber = /(PLAYER_\d+)/ // matches PLAYER_0, PLAYER_12, etc
  const parts = activity.description.split(matchPlayerNumber);

  const replaceNames = parts.map((part, i) => {
    if (part.match(matchPlayerNumber)) {
      const index = Number(part.replace('PLAYER_', ''))
      // Gets the name of the player.
      const player: PickFromPlayers = activity.participants[index]
      return `**${player.name}**`
    }
    return part;
  })
  return replaceNames.join('')
}

const logRound = (rounds: RoundActivityLog[]) => {
  const channel: AnyChannel = client.channels.cache.get(options.channelId) as TextChannel;
  if (gameStarted) {
    const round = rounds[currentRound];

    const getAllActivityDesc = round.activities?.map(activity => ({
      environment: activity.environment,
      description: replaceActivityDescPlaceholders(activity)
    }))
    // TODO: Replace these environments with icons
    const description = getAllActivityDesc.map(d => `${d.environment} | ${d.description}`);
    const embed = new MessageEmbed()
      .setColor('#9912B8')
      .setTitle(`**Round ${round.round_counter + 1}**`)
      .setDescription(`
      ${description.join('\n')}
  
      Players left: ${round.players_remaining}`)

    // Set the currentMessage to this message.
    channel.send({ embeds: [embed] })
    currentRound += 1;
  }
}


// todo: Tag the winners and runner ups
const logWinner = async (winners: PickFromPlayers[]) => {
  if (!gameStarted) {
    return;
  }

  const winnerData = winners.map(winner => ({
    ...winner,
    discord_id: winner.discord_tag && getUserFromUserTag(winner.discord_tag)?.id
  }))

  const channel: AnyChannel = client.channels.cache.get(options.channelId) as TextChannel;
  const embed = new MessageEmbed()
    .setColor('#9912B8')
    .setTitle(`**WINNER**`)
    .setDescription(`
Congratulations! 1st place goes to **${winnerData[0]?.discord_id ? tagUser(winnerData[0].discord_id) : winnerData[0].name}**.

2nd place **${winnerData[1]?.discord_id ? tagUser(winnerData[1].discord_id) : winnerData[1].name}**.
3rd place **${winnerData[2]?.discord_id ? tagUser(winnerData[2].discord_id) : winnerData[2].name}**.`)
    .setFooter(currentParamsId ? currentParamsId : '')

  // Set the currentMessage to this message.
  channel.send({
    embeds: [embed]
  })
  // End the games.
  gameStarted = false;
  currentRound = null;
}

/**
 * Useful to sync the player room data to discord if it's been awhile since the last CURRENT ENTRANTS message.
 */
const syncPlayerRoomData = ({ data, paramsId, error }: SyncPlayersResponseType) => {
  const channel: AnyChannel = client.channels.cache.get(options.channelId) as TextChannel;
  const allPlayerData = data?.map(player => ({
    ...player,
    discord_id: player.discord_tag && getUserFromUserTag(player.discord_tag)?.id
  }));

  const allPlayers = allPlayerData.map(player => player.discord_id ? tagUser(player.discord_id) : player.name)

  if (error) {
    channel.send(error);
    return;
  }

  // Create and send the current player embed message.
  createAndSendCurrentPlayerEmbed(channel, allPlayers, paramsId);
}

/**
 * Creates or updates the latest "CURRENT ENTRANTS" message from the bot.
 * @param data - Player and Room info
 * @returns 
 */
const updatePlayerRoomData = async (data: PlayerAndRoomInfoType) => {
  const allPlayerData = data?.allPlayers?.map(player => ({
    ...player,
    discord_id: player.discord_tag && getUserFromUserTag(player.discord_tag)?.id
  }));

  const allPlayers = allPlayerData.map(player => player.discord_id ? tagUser(player.discord_id) : player.name)

  const paramsId = data.roomInfo.params.id
  // We check to see if we want to create a new message or can find and older one to edit.
  if (currentMessage === null) {
    // We default want to create a new embed.
    let createNewEmbed = true;
    // Get the channel so we can get the last messages.
    const channel: AnyChannel = client.channels.cache.get(options.channelId) as TextChannel;
    // We check the last 5 messages to see if it was from the same room paramsId.
    const tempMessages = await channel.messages.fetch({ limit: 5 });
    const messages = Array.from(tempMessages).map(i => i[1])

    /**
     * We only want to set `createNewEmbed` to false if the last messages:
     * - were from the bot
     * - and the message had an embed with a title of 'CURRENT ENTRANTS'
     * - and the footer.text has the same text as the `paramsId`
     */
    for (const message of messages) {
      // If the author is the bot
      if (message.author.id === botId) {
        // And if the message has an embed + title is of the entrants.
        if (message.embeds.length > 0 && message.embeds[0].title === CURRENT_ENTRANTS) {
          // And finally the embeds footer is the same as the paramsId
          if (message.embeds[0]?.footer?.text === paramsId) {
            // If all conditions are met, we don't want to create a new embed.
            createNewEmbed = false;
            // We also want to set the currentMessage and currentParamsId as well
            currentMessage = message;
            currentParamsId = paramsId;
            break;
          }
        }
      }
    }

    // If we don't want to create a new embed, then we probably need to update it. 
    if (createNewEmbed) {
      createAndSendCurrentPlayerEmbed(channel, allPlayers, paramsId);
      return;
    }
  }

  const receivedEmbed = currentMessage.embeds[0];
  // If we have it, edit it.
  const editEmbed = new MessageEmbed(receivedEmbed)
    .setDescription(currentEntrantsDescription(allPlayers))

  currentMessage.edit({ embeds: [editEmbed] })
}

const currentEntrantsDescription = (allPlayers: string[]) => `
**Entrants**: ${allPlayers.join(', ')}

**Total Entrants:** ${allPlayers.length.toString()}

**Want to join the fight?**: If you see your name above, you're ready to brawl. If not, press the 'Join Game' button below.

**Why are some users tagged and others not?** Only players who chose to link their discord account to their player profile are shown above. If you'd like to do the same, visit 'settings' in the Rumble Raffle App.
`

/**
 * Creates and sends the Current Player Embed message.
 * @param channel - The channel to send the embed to
 * @param allPlayers - The players to add to the embed
 */
const createAndSendCurrentPlayerEmbed = (channel: TextChannel, allPlayers: string[], paramsId: string) => {
  const embed = new MessageEmbed()
    .setColor('#9912B8')
    .setTitle(CURRENT_ENTRANTS)
    .setURL(options.gameUrl)
    .setDescription(currentEntrantsDescription(allPlayers))
    .setFooter({ text: paramsId })

  const button = new MessageButton()
    .setCustomId(JOIN_GAME_BUTTON_ID)
    .setLabel('Join Game')
    .setStyle('PRIMARY');

  const row = new MessageActionRow()
    .addComponents(button);

  // Set the currentMessage to this message.
  channel.send({ embeds: [embed], content: '@here', components: [row] }).then(msg => {
    currentMessage = msg;
    currentParamsId = paramsId
  })
}


/**
 * 
 * @param channel 
 * @param message 
 * @param title 
 */
export const simpleMessageEmbed = (channel: TextChannel, message: string, title?: string) => {
  const embed = new MessageEmbed()
    .setColor('#9912B8')
    .setDescription(message)

  if (title) {
    embed
      .setTitle(title)
      .setURL(options.gameUrl)
  }

  // Set the currentMessage to this message.
  channel.send({ embeds: [embed] })
}