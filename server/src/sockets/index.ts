import { Server, Socket } from "socket.io";
import availableRoomsData from '../helpers/roomRumbleData';
import { definitions } from '@rumble-raffle-dao/types'
import { CLEAR_GAME, JOIN_GAME, JOIN_GAME_ERROR, JOIN_ROOM, START_GAME, UPDATE_ACTIVITY_LOG_ROUND, UPDATE_ACTIVITY_LOG_WINNER, UPDATE_PLAYER_LIST } from "@rumble-raffle-dao/types/constants";
import { addPlayer } from "../helpers/addPlayer";
import { getPlayersAndPrizeSplit } from "../helpers/getPlayersAndPrizeSplit";
import { getVisibleGameStateForClient } from "../helpers/getVisibleGameStateForClient";
import startGame from "./startGame";
import clearGame from "./clearGame";

let io: Server;
let roomSocket: Socket;

export const initRoom = (sio: Server, socket: Socket) => {
  io = sio;
  roomSocket = socket;

  console.log(`User Connected: ${roomSocket.id}`);

  // join_room only enters a socket room. It doesn't enter the user into a game.
  roomSocket.on(JOIN_ROOM, joinRoom);
  // join_game will enter a player into a game.
  roomSocket.on(JOIN_GAME, joinGame);
  roomSocket.on(START_GAME, (args) => startGame(io, args))
  roomSocket.on(CLEAR_GAME, (args) => clearGame(io, args))
}

/**
 * On joining room we want to:
 * - ??
 * - Return all players and the prize list
 */
function joinRoom(roomSlug: string) {
  try {
    const { roomData, gameState } = availableRoomsData[roomSlug];
    // console.log('---room', room, this.id);
    if (!roomData) {
      return;
    }
    this.join(roomSlug);
    console.log(`User with ID: ${this.id} joined room: ${roomSlug}`);
    const playersAndPrizeSplit = getPlayersAndPrizeSplit(roomSlug);
    io.to(this.id).emit(UPDATE_PLAYER_LIST, playersAndPrizeSplit);
    if (roomData.game_started) {
      const { visibleRounds, winners } = getVisibleGameStateForClient(roomData, gameState);
      // TODO: Limit this to whatever current logs are being shown.
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
async function joinGame(data: { playerData: definitions["users"]; roomSlug: string }) {
  try {
    // Will error if the player is already added to the game.
    const { error } = await addPlayer(data.roomSlug, data.playerData);
    if (error) {
      io.to(this.id).emit(JOIN_GAME_ERROR, error);
      return;
    }
    const playersAndPrizeSplit = getPlayersAndPrizeSplit(data.roomSlug);
    io.in(data.roomSlug).emit(UPDATE_PLAYER_LIST, playersAndPrizeSplit);
  } catch (error) {
    console.error('Server: joinGame', 'error')
  }
}
