import { SetupType } from "@rumble-raffle-dao/rumble";
import { EntireGameLog, definitions } from "@rumble-raffle-dao/types";
import client from "../client";
import { getAllActivities } from "../routes/api/activities";
import { createGame } from "./createRumble";
import { parseActivityLogForClient, parseActivityLogForDbPut } from "./parseActivityLogs";
import { selectPrizeSplitFromParams, selectPayoutFromGameData } from "./payoutHelpers";
import availableRoomsData from "./roomRumbleData";

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
export const startRumble = async (roomSlug: string): Promise<EntireGameLog> => {
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
  const finalGameData = await createGame({ activities, params, prizeSplit, initialPlayers });

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
