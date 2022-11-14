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
