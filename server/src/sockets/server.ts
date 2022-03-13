import { GameEndType, PlayerType, PrizeValuesType, PrizeSplitType } from "@rumble-raffle-dao/rumble";
import { RoomRumbleDataType } from "../..";

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
 * TODO:
 * - Make api call and add player to "players" db for given room?
 * - Tie someones wallet id with the `this.id` so can't join multiple browsers.
 */
function joinRoom(roomSlug: string) {
  const room = roomData[roomSlug];
  console.log('---Attempting to join room');
  // console.log('---data', roomData[roomSlug]);
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
 * - Add player to game
 * - ??
 * - Return all players and prize list
 */
function joinGame(data: { playerData: any; roomSlug: string }) {
  /**
   * TODO: 
   * - if player is already in game, don't add them. Duh.
   * - add 
   * - emit update player list
   */
  addPlayer(data.roomSlug, data.playerData);
  const playersAndPrizeSplit = getPlayersAndPrizeSplit(data.roomSlug);
  console.log(`User with ID: ${this.id} joined room: ${JSON.stringify(data)}`);
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
async function startGame(data: { playerData: any; roomSlug: string }) {
  console.log('--start game', data);
  // TODO: Only let game master start the game
  const gameData = await startAutoPlayGame(data.roomSlug);
  io.in(data.roomSlug).emit("update_activity_log", gameData.activityLogs)
  // TODO: Only release one part of the activity log at a time over time.
  // TODO: Display all players who earned a prize on a screen somewhere.
}

async function clearGame(data: { playerData: any; roomSlug: string }) {
  console.log('--clear game', data);
  // TODO: Only let game master clear the game
  const gameData = await clearRumble(data.roomSlug);
  io.in(data.roomSlug).emit("update_activity_log", gameData.activityLogs)
}

const addPlayer = (roomSlug: string, playerData: PlayerType) => {
  const room = roomData[roomSlug];
  if (!room) {
    console.log('---addPlayer--ERROR', roomSlug);
    return;
  }
  return room.rumble.addPlayer(playerData);
}

const getPlayersAndPrizeSplit = (roomSlug: string): { allPlayers: PlayerType[]; prizeSplit: PrizeValuesType } => {
  const room = roomData[roomSlug];
  if (!room) {
    console.log('---addPlayer--ERROR', roomSlug);
    return;
  }
  const allPlayers = room.rumble.getAllPlayers();
  const prizeSplit = room.rumble.getPrizes();
  console.log('----getPlayersAndPrizeSplit', JSON.stringify(allPlayers));
  return {
    allPlayers,
    prizeSplit
  }
}

const startAutoPlayGame = async (roomSlug: string): Promise<GameEndType> => {
  const room = roomData[roomSlug];
  if (!room) {
    console.log('---addPlayer--ERROR', roomSlug);
    return;
  }
  return await room.rumble.startAutoPlayGame();
}

const clearRumble = (roomSlug: string): Promise<GameEndType> => {
  const room = roomData[roomSlug];
  if (!room) {
    console.log('---addPlayer--ERROR', roomSlug);
    return;
  }
  return room.rumble.restartGame();
}
