import { PostgrestError } from "@supabase/supabase-js";
import { Server, Socket } from "socket.io";
import client from '../client';
import { createGame } from "../helpers/createRumble";
import availableRoomsData from '../helpers/roomRumbleData';
import { getAllActivities } from "../routes/api/activities";
import { selectPayoutFromGameData, selectPrizeSplitFromParams } from '../helpers/payoutHelpers';
import { parseActivityLogForClient, parseActivityLogForDbPut } from "../helpers/parseActivityLogs";
import {definitions, EntireGameLog, PlayerAndPrizeSplitType} from '@rumble-raffle-dao/types'
import { CLEAR_GAME, JOIN_GAME, JOIN_GAME_ERROR, JOIN_ROOM, START_GAME, UPDATE_ACTIVITY_LOG, UPDATE_PLAYER_LIST } from "@rumble-raffle-dao/types/constants";
import { SetupType } from "@rumble-raffle-dao/rumble";

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
  roomSocket.on(START_GAME, startGame)
  roomSocket.on(CLEAR_GAME, clearGame)
}

/**
 * On joining room we want to:
 * - ??
 * - Return all players and the prize list
 */
function joinRoom(roomSlug: string) {
  const room = availableRoomsData[roomSlug];
  // console.log('---room', room, this.id);
  if (!room) {
    return;
  }
  this.join(roomSlug);
  console.log(`User with ID: ${this.id} joined room: ${roomSlug}`);
  const playersAndPrizeSplit = getPlayersAndPrizeSplit(roomSlug);
  io.to(this.id).emit(UPDATE_PLAYER_LIST, playersAndPrizeSplit);
  if (room.game_started) {
    // TODO: Limit this to whatever current logs are being shown.
    io.to(this.id).emit(UPDATE_ACTIVITY_LOG, room.gameData);
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
    io.to(this.id).emit(JOIN_GAME_ERROR, error);
    return;
  }
  const playersAndPrizeSplit = getPlayersAndPrizeSplit(data.roomSlug);
  io.in(data.roomSlug).emit(UPDATE_PLAYER_LIST, playersAndPrizeSplit);
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
  // Check if they're an admin.
  const { data: userData, error: userError } = await client.from<definitions['users']>('users').select('is_admin').eq('public_address', data.playerData?.public_address)
  // If they aren't an admin, we do nothing.
  if (!userData[0].is_admin) {
    return;
  }
  // Only let the room owner start the game.
  if (data.playerData?.public_address !== room.created_by) {
    console.warn(`${data.playerData?.public_address} tried to start a game they are not the owner of.`);
    return;
  }
  // Game already started, do nothing about it.
  if (!room || room.game_started || room.players.length < 1) {
    console.log('---startRumble--ERROR', data.roomSlug);
    return;
  }
  const gameData = await startRumble(data.roomSlug);
  room.gameData = gameData;
  io.in(data.roomSlug).emit(UPDATE_ACTIVITY_LOG, gameData)
  // TODO: Only release one part of the activity log at a time over time.
  // TODO: Display all players who earned a prize on a screen somewhere.
}

// TODO: REMOVE THIS. SHOULD NOT BE ABLE TO CLEAR GAME DATA.
// ONLY USED FOR TESTING.
async function clearGame(data: { playerData: definitions["users"]; roomSlug: string }) {
  const room = availableRoomsData[data.roomSlug];
  // Check if they're an admin.
  const { data: userData, error: userError } = await client.from<definitions['users']>('users').select('is_admin').eq('public_address', data.playerData?.public_address)
  // If they aren't an admin, we do nothing.
  if (!userData[0].is_admin) {
    return;
  }
  if (data.playerData?.public_address !== room.created_by) {
    console.warn(`${data.playerData?.public_address} tried to clear a game they are not the owner of.`);
    return;
  }
  const payoutsRes = await client.from<definitions["payouts"]>('payouts').delete().match({ room_id: room.id });
  const gameRoundLogsRes = await client.from<definitions['game_round_logs']>('game_round_logs').delete().match({ room_id: room.id });
  const roomsRes = await client.from<definitions["rooms"]>('rooms').update({ game_started: false, winners: null }).match({ id: room.id });
  room.gameData = null;
  room.game_started = false;
  console.log('---cleared', { errors: [payoutsRes.error, roomsRes.error, gameRoundLogsRes.error] });
  io.in(data.roomSlug).emit(UPDATE_ACTIVITY_LOG, [])
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
): Promise<{ data?: definitions["players"][]; error?: PostgrestError | string; }> => {
  const room = availableRoomsData[roomSlug];
  if (!room) {
    return;
  }
  if (room.players.length > 900) {
    return { error: 'reached max players' }
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

const getPlayersAndPrizeSplit = (roomSlug: string): PlayerAndPrizeSplitType => {
  const room = availableRoomsData[roomSlug];
  if (!room) {
    console.log('---getPlayersAndPrizeSplit--ERROR', roomSlug);
    return;
  }
  const allPlayers = room.players
  const prizeSplit = selectPrizeSplitFromParams(room.params);
  const roomInfo: PlayerAndPrizeSplitType['roomInfo'] = {
    contract: {
      contract_address: room.contract.contract_address,
      network_name: room.contract.network_name,
      symbol: room.contract.symbol,
    },
    params: {
      alt_split_address: room.params.alt_split_address,
      created_by: room.params.created_by,
      entry_fee: room.params.entry_fee,
      pve_chance: room.params.pve_chance,
      revive_chance: room.params.revive_chance
    }
  }
  return {
    allPlayers,
    prizeSplit,
    roomInfo
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
const startRumble = async (roomSlug: string): Promise<EntireGameLog> => {
  const room = availableRoomsData[roomSlug];
  if (!room || room.game_started) {
    console.log('---startRumble--ERROR', roomSlug);
    return;
  }
  const { data: activities } = await getAllActivities();
  const prizeSplit: SetupType['prizeSplit'] = selectPrizeSplitFromParams(room.params);
  // RumbleApp expects players = {id, name}
  const initialPlayers: SetupType['initialPlayers'] = room.players.map(player => ({ ...player, id: player.public_address }))
  const params: SetupType['params'] = {
    chanceOfPve: room.params.pve_chance,
    chanceOfRevive: room.params.revive_chance,
    entryPrice: room.params.entry_fee
  }

  // TODO: Store this giant blob somewhere so we can go over the files later.
  // Autoplay the game
  const finalGameData = await createGame({activities, params, prizeSplit, initialPlayers});

  // Parse the package's activity log to a more usable format to send to client
  const parsedActivityLog = parseActivityLogForClient(finalGameData.gameActivityLogs, room.players);

  // Parse the activity log to store it to the db better
  const activitiesInGame = parseActivityLogForDbPut(parsedActivityLog, room);
  const activityLogSubmit = await client.from<definitions['game_round_logs']>('game_round_logs')
    .insert(activitiesInGame)
  if (activityLogSubmit.error) {
    console.error(activityLogSubmit.error);
  }

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
    .update({
      game_started: true,
      total_prize_purse: finalGameData.gamePayouts.total,
      winners: parsedActivityLog.winners.map(winner => winner.public_address)
    })
    .match({ id: room.id })
  if (updateRoomSubmit.error) {
    console.error(updateRoomSubmit.error);
  }
  // Set the game started to true.
  room.game_started = true;

  return parsedActivityLog;
}
