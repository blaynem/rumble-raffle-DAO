import { GameEndType, PrizeSplitType } from "@rumble-raffle-dao/rumble";
import { PostgrestError } from "@supabase/supabase-js";
import { Server, Socket } from "socket.io";
import { PickFromPlayers } from "../../types";
import { definitions } from "../../types/supabase";
import client from '../client';
import { createGame } from "../createRumble";
import availableRoomsData from '../roomRumbleData';

let io: Server;
let roomSocket: Socket;

export const initRoom = (sio: Server, socket: Socket) => {
  io = sio;
  roomSocket = socket;

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
  const room = availableRoomsData[roomSlug];
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
async function joinGame(data: { playerData: definitions["users"]; roomSlug: string }) {
  // Will error if the player is already added to the game.
  const { error } = await addPlayer(data.roomSlug, data.playerData);
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
async function startGame(data: { playerData: definitions["users"]; roomSlug: string }) {
  console.log('--start game', data);
  const room = availableRoomsData[data.roomSlug];
  if (room.gameData) {
    // Game already started, do nothing except return what was already there.
    io.in(data.roomSlug).emit("update_activity_log", room.gameData.activityLogs)
    return;
  }
  // TODO: Only let game master start the game
  const gameData = await startAutoPlayGame(data.roomSlug);
  room.gameData = gameData;
  io.in(data.roomSlug).emit("update_activity_log", gameData.activityLogs)
  // TODO: Only release one part of the activity log at a time over time.
  // TODO: Display all players who earned a prize on a screen somewhere.
}

// TODO: REMOVE THIS. SHOULD NOT BE ABLE TO CLEAR GAME DATA.
// ONLY USED FOR TESTING.
async function clearGame(data: { playerData: definitions["users"]; roomSlug: string }) {
  console.log('--clear game', data);
  const room = availableRoomsData[data.roomSlug];
  room.gameData = undefined;
  io.in(data.roomSlug).emit("update_activity_log", [])
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
const addPlayer = async (
  roomSlug: string,
  playerData: definitions["users"]
): Promise<{ data?: definitions["players"][]; error?: PostgrestError }> => {
  const room = availableRoomsData[roomSlug];
  if (!room) {
    return;
  }
  const { data, error } = await client.from<definitions["players"]>('players')
    .insert({ room_id: room.id, player: playerData.publicAddress, slug: roomSlug })
  if (error) {
    // If error, we return the error.
    return { error };
  }
  // Otherwise add the player to the rumble locally.
  room.players.push(playerData);
  return { data }
}

const getPlayersAndPrizeSplit = (roomSlug: string): { allPlayers: PickFromPlayers[]; prizeSplit: PrizeSplitType } => {
  const room = availableRoomsData[roomSlug];
  if (!room) {
    console.log('---getPlayersAndPrizeSplit--ERROR', roomSlug);
    return;
  }
  const allPlayers = room.players
  const prizeSplit = selectPrizeSplitFromParams(room.params);
  return {
    allPlayers,
    prizeSplit
  }
}

const startAutoPlayGame = async (roomSlug: string): Promise<GameEndType> => {
  const room = availableRoomsData[roomSlug];
  if (!room) {
    console.log('---startAutoPlayGame--ERROR', roomSlug);
    return;
  }
  // RumbleApp expects {id, name}
  const players = room.players.map(player => ({ ...player, id: player.publicAddress }))
  const prizeSplit = selectPrizeSplitFromParams(room.params);
  return await createGame(undefined, prizeSplit, players);
}

const selectPrizeSplitFromParams = (params: definitions['room_params']): PrizeSplitType => ({
  altSplit: params.prize_alt_split,
  creatorSplit: params.prize_creator,
  firstPlace: params.prize_first,
  kills: params.prize_kills,
  secondPlace: params.prize_second,
  thirdPlace: params.prize_third,
})