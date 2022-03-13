import RumbleApp, { GameEndType, PlayerType, PrizeValuesType, PrizeSplitType, ActivitiesObjType, RumbleRaffleInterface } from "@rumble-raffle-dao/rumble";
import { RoomRumbleDataType } from "../..";
import { PVE_ACTIVITIES, PVP_ACTIVITIES, REVIVE_ACTIVITIES } from '../../activities';

const defaultGameActivities: ActivitiesObjType = {
  PVE: PVE_ACTIVITIES,
  PVP: PVP_ACTIVITIES,
  REVIVE: REVIVE_ACTIVITIES
};

const defaultPrizeSplit: PrizeSplitType = {
  kills: 20,
  thirdPlace: 5,
  secondPlace: 15,
  firstPlace: 50,
  altSplit: 9,
  creatorSplit: 1,
}

let io;
let roomSocket;
// Ex: roomData = { 123: Rumble({...exampleParams}) }
let roomData: RoomRumbleDataType;

export const initRoom = (sio, socket, roomRumbleData) => {
  io = sio;
  roomSocket = socket;
  roomData = roomRumbleData;

  console.log(`User Connected: ${roomSocket.id}`);

  roomSocket.on("join_room", joinRoom);
  roomSocket.on("join_game", joinGame);
  roomSocket.on("start_game", startGame)
  roomSocket.on("clear_game", clearGame)
}

/**
 * On joining room we want to:
 * - ??
 * - Return all players and the prize list
 * TODO: Tie someones wallet id with the `this.id` so can't join multiple browsers.
 */
function joinRoom(roomId: string) {
  const room = roomData[roomId];
  console.log('---Attempting to join room');
  // console.log('---data', roomData[roomId]);
  if (!room) {
    return;
  }
  this.join(roomId);
  console.log(`User with ID: ${this.id} joined room: ${roomId}`);
  const playersAndPrizeSplit = getPlayersAndPrizeSplit(roomId);
  io.to(this.id).emit("update_player_list", playersAndPrizeSplit);
}

/**
 * On Join Game we want to:
 * - Add player to game
 * - ??
 * - Return all players and prize list
 */
function joinGame(data: { playerData: any; roomId: string }) {
  /**
   * TODO: 
   * - if player is already in game, don't add them. Duh.
   * - add 
   * - emit update player list
   */
  addPlayer(data.roomId, data.playerData);
  const playersAndPrizeSplit = getPlayersAndPrizeSplit(data.roomId);
  console.log(`User with ID: ${this.id} joined room: ${JSON.stringify(data)}`);
  io.in(data.roomId).emit("update_player_list", playersAndPrizeSplit);
}

/**
 * On Start of game:
 * - Assure only the game master can start the game
 * - Send activity log data
 * - ??
 * - ??
 * - TODO: Add timer so round info gets sent every 30s or so
 */
async function startGame(data: { playerData: any; roomId: string }) {
  console.log('--start game', data);
  // TODO: Only let game master start the game
  const gameData = await startAutoPlayGame(data.roomId);
  io.in(data.roomId).emit("update_activity_log", gameData.activityLogs)
  // TODO: Only release one part of the activity log at a time over time.
  // TODO: Display all players who earned a prize on a screen somewhere.
}

async function clearGame(data: { playerData: any; roomId: string }) {
  console.log('--clear game', data);
  // TODO: Only let game master clear the game
  const gameData = await clearRumble(data.roomId);
  io.in(data.roomId).emit("update_activity_log", gameData.activityLogs)
}

const addPlayer = (roomId: string, playerData: PlayerType) => {
  if (!roomData[roomId]) {
    console.log('---addPlayer--ERROR', roomId);
    return;
  }
  return roomData[roomId].addPlayer(playerData);
}

const getPlayersAndPrizeSplit = (roomId: string): { allPlayers: PlayerType[]; prizeSplit: PrizeValuesType } => {
  if (!roomData[roomId]) {
    console.log('---addPlayer--ERROR', roomId);
    return;
  }
  const allPlayers = roomData[roomId].getAllPlayers();
  const prizeSplit = roomData[roomId].getPrizes();
  console.log('----getPlayersAndPrizeSplit', JSON.stringify(allPlayers));
  return {
    allPlayers,
    prizeSplit
  }
}

const startAutoPlayGame = async (roomId: string): Promise<GameEndType> => {
  if (!roomData[roomId]) {
    console.log('---addPlayer--ERROR', roomId);
    return;
  }
  return await roomData[roomId].startAutoPlayGame();
}

const clearRumble = (roomId: string): Promise<GameEndType> => {
  if (!roomData[roomId]) {
    console.log('---addPlayer--ERROR', roomId);
    return;
  }
  return roomData[roomId].restartGame();
}
