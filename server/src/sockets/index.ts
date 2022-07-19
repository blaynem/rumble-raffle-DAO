import { Server, Socket } from "socket.io";
import availableRoomsData from '../helpers/roomRumbleData';
import { JOIN_GAME_ERROR, JOIN_ROOM, START_GAME, SYNC_PLAYERS_REQUEST, SYNC_PLAYERS_RESPONSE, UPDATE_ACTIVITY_LOG_ROUND, UPDATE_ACTIVITY_LOG_WINNER, UPDATE_PLAYER_LIST } from "@rumble-raffle-dao/types/constants";
import { addPlayer } from "../helpers/addPlayer";
import { getPlayersAndRoomInfo } from "../helpers/getPlayersAndRoomInfo";
import { getVisibleGameStateForClient } from "../helpers/getVisibleGameStateForClient";
import startGame from "./startGame";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData, IronSessionUserData } from "@rumble-raffle-dao/types";

export let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export let roomSocket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export const initRoom = (sio: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>, socket: Socket) => {
  io = sio;
  roomSocket = socket;

  // TODO: Do any of these (recieved) need to be sockets or can they all be fetches instead?

  // join_room only enters a socket room. It doesn't enter the user into a game.
  roomSocket.on(JOIN_ROOM, joinRoom);
  // join_game will enter a player into a game.
  roomSocket.on(START_GAME, (user, roomSlug) => startGame(io, user, roomSlug))
  // Get's the player data to discord bot if necessary.
  roomSocket.on(SYNC_PLAYERS_REQUEST, syncPlayerRoomData)
}

/**
 * A user joins a room when they visit the url.
 * Note: This is not joining a game, this is simply viewing it.
 */
function joinRoom(roomSlug: string) {
  try {
    this.join(roomSlug);
    if (!availableRoomsData[roomSlug]) {
      return
    }
    const { roomData, gameState } = availableRoomsData[roomSlug];
    if (!roomData) {
      return;
    }
    const playersAndRoomInfo = getPlayersAndRoomInfo(roomSlug);
    io.to(this.id).emit(UPDATE_PLAYER_LIST, playersAndRoomInfo);
    // If a player joins the room and a game is already started, we should show them the current game state.
    if (roomData.params.game_started) {
      const { visibleRounds, winners } = getVisibleGameStateForClient(roomData, gameState);
      // Limit this to whatever current logs are being shown.
      io.to(this.id).emit(UPDATE_ACTIVITY_LOG_ROUND, visibleRounds);
      io.to(this.id).emit(UPDATE_ACTIVITY_LOG_WINNER, winners);
    }
  } catch (error) {
    console.error('Server: joinRoom', error)
  }
}

async function syncPlayerRoomData(roomSlug: string) {
  if (!availableRoomsData[roomSlug]) {
    io.in(roomSlug).emit(SYNC_PLAYERS_RESPONSE, { error: `Room "${roomSlug}" hasn't been created yet.`, data: null, paramsId: null })
    return
  }
  const { roomData } = availableRoomsData[roomSlug];
  io.in(roomSlug).emit(SYNC_PLAYERS_RESPONSE, { data: roomData?.players, paramsId: roomData?.params.id })
}