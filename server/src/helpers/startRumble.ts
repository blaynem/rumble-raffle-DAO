import { SetupType } from "@rumble-raffle-dao/rumble/types";
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
 * - - update `rooms` in db with `total_prize_purse`, `game_completed`
 * - - dumps activity logs to supabase bucket
 */
export const startRumble = async (roomSlug: string): Promise<EntireGameLog> => {
  try {
    const { roomData } = availableRoomsData[roomSlug];
    if (!roomData || roomData.game_completed || roomData.game_started) {
      console.log('---startRumble--ERROR', roomSlug);
      return;
    }
    const { data: activities } = await getAllActivities();
    const prizeSplit: SetupType['prizeSplit'] = selectPrizeSplitFromParams(roomData.params);
    // RumbleApp expects players = {id, name}
    // TODO: This will potentially be limited to only 1000 results.
    // We need to assure there aren't more than that before starting.
    // Get all current players in case we missed someone in the db when it's started.
    // Or in case they changed their name and we don't see it.
    const { data } = await client.from<definitions['players'] & { users: definitions['users'] }>('players')
      .select(`users ( public_address ,name)`)
      .eq('room_id', roomData.id);

    // Map the data to what rumble expects
    const initialPlayers = data.map(({ users }) => ({
      id: users.public_address,
      name: users.name
    }))

    const params: SetupType['params'] = {
      chanceOfPve: roomData.params.pve_chance,
      chanceOfRevive: roomData.params.revive_chance,
      entryPrice: roomData.params.entry_fee
    }

    // TODO: Store this giant blob somewhere so we can go over the files later.
    // Autoplay the game
    const finalGameData = await createGame({ activities, params, prizeSplit, initialPlayers: initialPlayers as any });

    // Parse the package's activity log to a more usable format to send to client
    const parsedActivityLog = parseActivityLogForClient(finalGameData.gameActivityLogs, roomData.players);

    // Parse the activity log to store it to the db better
    const activitiesInGame = parseActivityLogForDbPut(parsedActivityLog, roomData);
    const activityLogSubmit = await client.from<definitions['game_round_logs']>('game_round_logs')
      .insert(activitiesInGame)
    if (activityLogSubmit.error) {
      console.error(activityLogSubmit.error);
    }

    // Calculate payout info
    const payoutInfo = selectPayoutFromGameData(roomData, finalGameData);
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
      .match({ id: roomData.id })
    if (updateRoomSubmit.error) {
      console.error(updateRoomSubmit.error);
    }
    // Set the game started to true.
    roomData.game_started = true;

    return parsedActivityLog;
  } catch (error) {
    console.error('Server: startRumble', error);
  }
}
