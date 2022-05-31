import { Server, Socket } from "socket.io";
import availableRoomsData from '../helpers/roomRumbleData';
import { JOIN_GAME, JOIN_GAME_ERROR, JOIN_ROOM, START_GAME, UPDATE_ACTIVITY_LOG_ROUND, UPDATE_ACTIVITY_LOG_WINNER, UPDATE_PLAYER_LIST } from "@rumble-raffle-dao/types/constants";
import { addPlayer } from "../helpers/addPlayer";
import { getPlayersAndRoomInfo } from "../helpers/getPlayersAndRoomInfo";
import { getVisibleGameStateForClient } from "../helpers/getVisibleGameStateForClient";
import startGame from "./startGame";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData, IronSessionUserData } from "@rumble-raffle-dao/types";

let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
let roomSocket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export const initRoom = (sio: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>, socket: Socket) => {
  io = sio;
  roomSocket = socket;

  // join_room only enters a socket room. It doesn't enter the user into a game.
  roomSocket.on(JOIN_ROOM, joinRoom);
  // join_game will enter a player into a game.
  roomSocket.on(JOIN_GAME, joinGame);
  roomSocket.on(START_GAME, (user, roomSlug) => startGame(io, user, roomSlug))
}

/**
 * On joining room we want to:
 * - ??
 * - Return all players and the prize list
 */
function joinRoom(roomSlug: string) {
  try {
    if (!availableRoomsData[roomSlug]) {
      return
    }
    const { roomData, gameState } = availableRoomsData[roomSlug];
    if (!roomData) {
      return;
    }
    this.join(roomSlug);
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

/**
 * On Join Game we want to:
 * - Do things
 */
async function joinGame(user: IronSessionUserData, roomSlug: string) {
  try {
    // Will error if the player is already added to the game.
    const { data, error } = await addPlayer(roomSlug, user);

    if (error) {
      io.to(this.id).emit(JOIN_GAME_ERROR, error);
      return;
    }
    const playersAndRoomInfo = getPlayersAndRoomInfo(roomSlug);
    io.in(roomSlug).emit(UPDATE_PLAYER_LIST, playersAndRoomInfo);
  } catch (error) {
    console.error('Server: joinGame', 'error')
  }
}
