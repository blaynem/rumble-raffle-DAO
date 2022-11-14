require('dotenv').config()
import { ServerToClientEvents, ClientToServerEvents } from "@rumble-raffle-dao/types";
import { GAME_START_COUNTDOWN, JOIN_ROOM, NEW_GAME_CREATED, NEXT_ROUND_START_COUNTDOWN, SYNC_PLAYERS_RESPONSE, UPDATE_ACTIVITY_LOG_ROUND, UPDATE_ACTIVITY_LOG_WINNER } from "@rumble-raffle-dao/types/constants";
import { Socket, io } from "socket.io-client";
import { BASE_API_URL } from "../../constants";
import { AllGuildContexts } from "../guildContext";
import { newGameCreated } from "./newGameCreated";
import { syncPlayerRoomData } from "./syncPlayerRoomData";
import { logWinner } from "./logWinner";
import { logRound } from "./logRound";
import { gameStartCountdown, nextRoundStartCountdown } from "./countdown";


export const JOIN_GAME_EMOJI = '⚔';

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(BASE_API_URL);

export const initSockets = (allGuildContexts: AllGuildContexts, slugs: string[]) => {
  // Join the socket with the given guild slug
  socket.emit(JOIN_ROOM, slugs);

  socket.on(NEW_GAME_CREATED, (roomData) => {
    const guild = allGuildContexts.getGuildBySlug(roomData.room.slug);
    newGameCreated(guild, roomData)
  });

  socket.on(SYNC_PLAYERS_RESPONSE, (response, slug) => {
    const guild = allGuildContexts.getGuildBySlug(slug);
    syncPlayerRoomData(guild, response, slug);
  })

  socket.on(UPDATE_ACTIVITY_LOG_WINNER, (winners, slug) => {
    const guild = allGuildContexts.getGuildBySlug(slug);
    logWinner(guild, winners)
  });

  socket.on(UPDATE_ACTIVITY_LOG_ROUND, (rounds, slug) => {
    const guild = allGuildContexts.getGuildBySlug(slug);
    logRound(guild, rounds);
  });

  socket.on(GAME_START_COUNTDOWN, (timeToStart, slug) => {
    const guild = allGuildContexts.getGuildBySlug(slug);
    gameStartCountdown(guild, timeToStart)
  });

  socket.on(NEXT_ROUND_START_COUNTDOWN, (timeToStart, slug) => {
    const guild = allGuildContexts.getGuildBySlug(slug);
    nextRoundStartCountdown(guild, timeToStart)
  });

  socket.on('disconnect', () => {
    console.log('--DISCORD BOT DISCONNECTED--');
    // Rejoin room on disconnect
    socket.emit(JOIN_ROOM, slugs);
  });
}

// Most likely do not need this anymore.
// /**
//  * Creates or updates the latest "CURRENT ENTRANTS" message from the bot.
//  * @param data - Player and Room info
//  * @returns 
//  */
//  const updatePlayerRoomData = async (data: PlayerAndRoomInfoType) => {
//   const allPlayerData = data?.allPlayers?.map(player => {
//     if ((player as DiscordPlayer)?.id_origin === 'DISCORD') {
//       return {
//         ...player,
//         discord_id: player.id
//       }
//     }
//     return player;
//   });

//   const allPlayers = mapAllPlayersToDiscordId(allPlayerData)

//   const paramsId = data.roomInfo.params.id
//   // We check to see if we want to create a new message or can find and older one to edit.
//   if (currentMessage === null) {
//     // We default want to create a new embed.
//     let createNewEmbed = true;
//     // Get the channel so we can get the last messages.
//     const channel: AnyChannel = client.channels.cache.get(CONFIG.channelId) as TextChannel;
//     // We check the last 5 messages to see if it was from the same room paramsId.
//     const tempMessages = await channel.messages.fetch({ limit: 5 });
//     const messages = Array.from(tempMessages).map(i => i[1])

//     /**
//      * We only want to set `createNewEmbed` to false if the last messages:
//      * - were from the bot
//      * - and the message had an embed with a title of 'CURRENT ENTRANTS'
//      * - and the footer.text has the same text as the `paramsId`
//      */
//     for (const message of messages) {
//       // If the author is the bot
//       if (message.author.id === process.env.APP_ID) {
//         // And if the message has an embed + title is of the entrants.
//         if (message.embeds.length > 0 && message.embeds[0].title === NEXT_RUMBLE_BEGINS) {
//           // And finally the embeds footer is the same as the paramsId
//           if (message.embeds[0]?.footer?.text === paramsId) {
//             // If all conditions are met, we don't want to create a new embed.
//             createNewEmbed = false;
//             // We also want to set the currentMessage and currentParamsId as well
//             currentMessage = message;
//             currentParamsId = paramsId;
//             break;
//           }
//         }
//       }
//     }

//     // If we don't want to create a new embed, then we probably need to update it. 
//     if (createNewEmbed) {
//       createAndSendCurrentPlayerEmbed(channel, paramsId);
//       return;
//     }
//   }

//   const receivedEmbed = currentMessage.embeds[0];
//   // If we have it, edit it.
//   const editEmbed = new MessageEmbed(receivedEmbed)
//     .setDescription(nextRumbleDescription())

//   currentMessage.edit({ embeds: [editEmbed] })
// }