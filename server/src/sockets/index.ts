import { Server, Socket } from "socket.io";
import availableRoomsData from '../gameState/roomRumbleData';
import { JOIN_ROOM, SYNC_PLAYERS_REQUEST, SYNC_PLAYERS_RESPONSE, UPDATE_ACTIVITY_LOG_ROUND, UPDATE_ACTIVITY_LOG_WINNER, UPDATE_PLAYER_LIST } from "@rumble-raffle-dao/types/constants";
import { getPlayersAndRoomInfo } from "../helpers/getPlayersAndRoomInfo";
import { getVisibleGameStateForClient } from "../helpers/getVisibleGameStateForClient";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from "@rumble-raffle-dao/types";

export let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export let roomSocket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export const initRoom = (sio: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>, socket: Socket) => {
  io = sio;
  roomSocket = socket;

  // join_room only enters a socket room. It doesn't enter the user into a game.
  roomSocket.on(JOIN_ROOM, joinRoom);
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
    // todo: This needs to be done for the discord channel things.
    if (!availableRoomsData.getRoom(roomSlug)) {
      return
    }
    const { roomData, gameState } = availableRoomsData.getRoom(roomSlug);
    if (!roomData) {
      return;
    }
    const playersAndRoomInfo = getPlayersAndRoomInfo(roomSlug);
    io.to(this.id).emit(UPDATE_PLAYER_LIST, playersAndRoomInfo, roomSlug);
    // If a player joins the room and a game is already started, we should show them the current game state.
    if (roomData.params.game_started) {
      const { visibleRounds, winners } = getVisibleGameStateForClient(roomData, gameState);
      // Limit this to whatever current logs are being shown.
      io.to(this.id).emit(UPDATE_ACTIVITY_LOG_ROUND, visibleRounds, roomSlug);
      io.to(this.id).emit(UPDATE_ACTIVITY_LOG_WINNER, winners, roomSlug);
    }
  } catch (error) {
    console.error('Server: joinRoom', error)
  }
}

async function syncPlayerRoomData(roomSlug: string) {
  if (!availableRoomsData.getRoom(roomSlug)) {
    io.in(roomSlug).emit(SYNC_PLAYERS_RESPONSE, { error: `Room "${roomSlug}" hasn't been created yet.`, data: null, paramsId: null }, roomSlug)
    return
  }
  const { roomData } = availableRoomsData.getRoom(roomSlug);
  io.in(roomSlug).emit(SYNC_PLAYERS_RESPONSE, { data: roomData?.players, paramsId: roomData?.params.id }, roomSlug)
}