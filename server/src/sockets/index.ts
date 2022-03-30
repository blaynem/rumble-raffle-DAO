import { Server, Socket } from "socket.io";
import client from '../client';
import availableRoomsData from '../helpers/roomRumbleData';
import { definitions } from '@rumble-raffle-dao/types'
import { CLEAR_GAME, JOIN_GAME, JOIN_GAME_ERROR, JOIN_ROOM, START_GAME, UPDATE_ACTIVITY_LOG, UPDATE_PLAYER_LIST } from "@rumble-raffle-dao/types/constants";
import { startRumble } from "../helpers/startRumble";
import { addPlayer } from "../helpers/addPlayer";
import { getPlayersAndPrizeSplit } from "../helpers/getPlayersAndPrizeSplit";

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

