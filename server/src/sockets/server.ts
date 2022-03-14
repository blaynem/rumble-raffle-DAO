import { GameEndType, PlayerType, PrizeValuesType, PrizeSplitType } from "@rumble-raffle-dao/rumble";
import { Server, Socket } from "socket.io";
import { RoomRumbleDataType } from "../../types/server";
import { PostgrestError, SupabasePlayersType, SupabaseUserType } from "../../types/supabase";
import client from '../client';

let io: Server;
let roomSocket: Socket;
let roomData: RoomRumbleDataType;

export const initRoom = (sio: Server, socket: Socket, roomRumbleData: RoomRumbleDataType) => {
  io = sio;
  roomSocket = socket;
  roomData = roomRumbleData;

  console.log(`User Connected: ${roomSocket.id}`);

  // join_room only enters a socket room. It doesn't enter the user into a game.
  roomSocket.on("join_room", joinRoom);
  // join_game will enter a player into a game.
  roomSocket.on("join_game", joinGame);
  roomSocket.on("start_game", startGame)
  roomSocket.on("clear_game", clearGame)
}

/**
 * On joining room we want to:
 * - ??
 * - Return all players and the prize list
 */
function joinRoom(roomSlug: string) {
  const room = roomData[roomSlug];
  if (!room) {
    return;
  }
  this.join(roomSlug);
  console.log(`User with ID: ${this.id} joined room: ${roomSlug}`);
  const playersAndPrizeSplit = getPlayersAndPrizeSplit(roomSlug);
  io.to(this.id).emit("update_player_list", playersAndPrizeSplit);
}

/**
 * On Join Game we want to:
 * - Do things
 */
async function joinGame(data: { playerData: SupabaseUserType; roomSlug: string }) {
  // Will error if the player is already added to the game.
  const {error} = await addPlayer(data.roomSlug, data.playerData);
  if (error) {
    return;
  }
  const playersAndPrizeSplit = getPlayersAndPrizeSplit(data.roomSlug);
  io.in(data.roomSlug).emit("update_player_list", playersAndPrizeSplit);
}

/**
 * On Start of game:
 * - Assure only the game master can start the game
 * - Send activity log data
 * - ??
 * - ??
 * - TODO: Add timer so round info gets sent every 30s or so
 */
async function startGame(data: { playerData: SupabaseUserType; roomSlug: string }) {
  console.log('--start game', data);
  // TODO: Only let game master start the game
  const gameData = await startAutoPlayGame(data.roomSlug);
  io.in(data.roomSlug).emit("update_activity_log", gameData.activityLogs)
  // TODO: Only release one part of the activity log at a time over time.
  // TODO: Display all players who earned a prize on a screen somewhere.
}

async function clearGame(data: { playerData: SupabaseUserType; roomSlug: string }) {
  console.log('--clear game', data);
  // TODO: Only let game master clear the game
  const gameData = await clearRumble(data.roomSlug);
  io.in(data.roomSlug).emit("update_activity_log", gameData.activityLogs)
}

/**
 * Add player should:
 * - check if playerId is already in `players` db. If so, return "already added" or something
 * - If not present in db, we make need to start a crypto tx to charge them to join game.
 * - After success, we insert playerId + roomId to `players` db
 * - Then we return success / fail?
 * 
 * @param roomSlug
 * @param playerData 
 * @returns 
 */
const addPlayer = async (roomSlug: string, playerData: SupabaseUserType): Promise<{ data?: SupabasePlayersType[]; error?: PostgrestError }> => {
  const room = roomData[roomSlug];
  if (!room) {
    return;
  }
  const { data, error } = await client.from<SupabasePlayersType>('players').insert({ room_id: room.id, player_id: playerData.id })
  if (error) {
    // If error, we return the error.
    return { error };
  }
  // Otherwise add the player to the rumble locally.
  room.rumble.addPlayer(playerData);
  return { data }
}

const getPlayersAndPrizeSplit = (roomSlug: string): { allPlayers: PlayerType[]; prizeSplit: PrizeValuesType } => {
  const room = roomData[roomSlug];
  if (!room) {
    console.log('---getPlayersAndPrizeSplit--ERROR', roomSlug);
    return;
  }
  const allPlayers = room.rumble.getAllPlayers();
  const prizeSplit = room.rumble.getPrizes();
  return {
    allPlayers,
    prizeSplit
  }
}

const startAutoPlayGame = async (roomSlug: string): Promise<GameEndType> => {
  const room = roomData[roomSlug];
  if (!room) {
    console.log('---startAutoPlayGame--ERROR', roomSlug);
    return;
  }
  return await room.rumble.startAutoPlayGame();
}

const clearRumble = (roomSlug: string): Promise<GameEndType> => {
  const room = roomData[roomSlug];
  if (!room) {
    console.log('---clearRumble--ERROR', roomSlug);
    return;
  }
  return room.rumble.restartGame();
}
