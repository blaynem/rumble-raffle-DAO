import { definitions } from "@rumble-raffle-dao/types";
import { UPDATE_ACTIVITY_LOG_ROUND, UPDATE_ACTIVITY_LOG_WINNER } from "@rumble-raffle-dao/types/constants";
import { Server } from "socket.io";
import client from "../client";
import availableRoomsData, { defaultGameState } from "../helpers/roomRumbleData";

// TODO: REMOVE THIS. SHOULD NOT BE ABLE TO CLEAR GAME DATA.
// ONLY USED FOR TESTING.
async function clearGame(io: Server, data: { playerData: definitions["users"]; roomSlug: string }) {
  const { roomData, gameState } = availableRoomsData[data.roomSlug];
  // Check if they're an admin.
  const { data: userData, error: userError } = await client.from<definitions['users']>('users').select('is_admin').eq('public_address', data.playerData?.public_address)
  // If they aren't an admin, we do nothing.
  if (!userData[0].is_admin) {
    return;
  }
  if (data.playerData?.public_address !== roomData.created_by) {
    console.warn(`${data.playerData?.public_address} tried to clear a game they are not the owner of.`);
    return;
  }
  const payoutsRes = await client.from<definitions["payouts"]>('payouts').delete().match({ room_id: roomData.id });
  const gameRoundLogsRes = await client.from<definitions['game_round_logs']>('game_round_logs').delete().match({ room_id: roomData.id });
  const roomsRes = await client.from<definitions["rooms"]>('rooms').update({ game_completed: false, winners: null }).match({ id: roomData.id });
  roomData.gameData = null;
  roomData.game_completed = false;
  roomData.game_started = false;
  // Reset gameState as well
  gameState.gameCompleted = false;
  gameState.showWinners = false;
  gameState.roundCounter= 0;
  console.log('---cleared', { errors: [payoutsRes.error, roomsRes.error, gameRoundLogsRes.error] });
  io.in(data.roomSlug).emit(UPDATE_ACTIVITY_LOG_ROUND, [])
  io.in(data.roomSlug).emit(UPDATE_ACTIVITY_LOG_WINNER, [])
}

export default clearGame;