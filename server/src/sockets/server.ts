// import fs from 'fs';
import { GameEndType, PrizeSplitType } from "@rumble-raffle-dao/rumble";
import { PostgrestError } from "@supabase/supabase-js";
import { Server, Socket } from "socket.io";
import { PickFromPlayers } from "../../types";
import { definitions } from "../../types/supabase";
import client from '../client';
import { createGame } from "../helpers/createRumble";
import availableRoomsData from '../helpers/roomRumbleData';
import { getAllActivities } from "../routes/api/activities";
import { selectPayoutFromGameData, selectPrizeSplitFromParams } from '../helpers/payoutHelpers';

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
  console.log('---room', room, this.id);
  if (!room) {
    return;
  }
  this.join(roomSlug);
  console.log(`User with ID: ${this.id} joined room: ${roomSlug}`);
  const playersAndPrizeSplit = getPlayersAndPrizeSplit(roomSlug);
  io.to(this.id).emit("update_player_list", playersAndPrizeSplit);
  if (room.game_started) {
    // TODO: Limit this to whatever current logs are being shown.
    io.to(this.id).emit("update_activity_log", room.gameData.activityLogs);
  }
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
  const room = availableRoomsData[data.roomSlug];
  // Only let the room owner start the game.
  if (data.playerData.public_address !== room.created_by) {
    console.warn(`${data.playerData.public_address} tried to start a game they are not the owner of.`);
    return;
  }
  // Game already started, do nothing about it.
  if (!room || room.game_started) {
    console.log('---startRumble--ERROR', data.roomSlug);
    return;
  }
  const gameData = await startRumble(data.roomSlug);
  room.gameData = gameData;
  io.in(data.roomSlug).emit("update_activity_log", gameData.activityLogs)
  // TODO: Only release one part of the activity log at a time over time.
  // TODO: Display all players who earned a prize on a screen somewhere.
}

// TODO: REMOVE THIS. SHOULD NOT BE ABLE TO CLEAR GAME DATA.
// ONLY USED FOR TESTING.
async function clearGame(data: { playerData: definitions["users"]; roomSlug: string }) {
  const room = availableRoomsData[data.roomSlug];
  if (data.playerData.public_address !== room.created_by) {
    console.warn(`${data.playerData.public_address} tried to clear a game they are not the owner of.`);
    return;
  }
  const payoutsRes = await client.from<definitions["payouts"]>('payouts').delete().match({ room_id: room.id });
  const roomsRes = await client.from<definitions["rooms"]>('rooms').update({ game_started: false }).match({ id: room.id });
  room.gameData = null;
  room.game_started = false;
  console.log('---cleared', { errors: [payoutsRes.error, roomsRes.error] });
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
    .insert({ room_id: room.id, player: playerData.public_address, slug: roomSlug })
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

/**
 * Starting a rumble will:
 * - Get all players, and prizeSplit from params
 * - fetch all activities to play
 * - create the game and play it
 * 
 * - After createGame finishes:
 * - - game payouts to db
 * - - update `rooms` in db with `total_prize_purse`, `game_started`
 * - - dumps activity logs to supabase bucket
 */
const startRumble = async (roomSlug: string): Promise<GameEndType> => {
  const room = availableRoomsData[roomSlug];
  if (!room || room.game_started) {
    console.log('---startRumble--ERROR', roomSlug);
    return;
  }
  const { data: allActivities } = await getAllActivities();
  const prizeSplit = selectPrizeSplitFromParams(room.params);
  // RumbleApp expects players = {id, name}
  const players = room.players.map(player => ({ ...player, id: player.public_address }))

  // Autoplay the game
  const finalGameData = await createGame(allActivities, prizeSplit, players);

  // Calculate payout info
  const payoutInfo = selectPayoutFromGameData(room, finalGameData);
  // Submit all payouts to db
  const payoutSubmit = await client.from<definitions['payouts']>('payouts')
    .insert(payoutInfo);
  if (payoutSubmit.error) {
    console.error(payoutSubmit.error);
  }
  // Update the rooms
  const updateRoomSubmit = await client.from<definitions['rooms']>('rooms')
    .update({ game_started: true, total_prize_purse: finalGameData.gamePayouts.total })
    .match({ id: room.id })
  if (updateRoomSubmit.error) {
    console.error(updateRoomSubmit.error);
  }
  // Set the game started to true.
  room.game_started = true;

  // const stringifyedData = JSON.stringify(finalGameData);
  // fs.writeFile('finalGameData.json', stringifyedData, 'utf8', (err) => {
  //   if (err) console.log('error', err);
  // });


  console.log(finalGameData);
  return finalGameData;
}
