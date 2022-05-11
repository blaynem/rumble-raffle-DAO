import { SetupType } from "@rumble-raffle-dao/rumble/types";
import { EntireGameLog } from "@rumble-raffle-dao/types";
import prisma from "../client";
import { getAllActivities } from "../routes/api/activities";
import { createGame } from "./createRumble";
import { getGameDataFromDb } from "./getGameDataFromDb";
import { parseActivityLogForClient, parseActivityLogForDbPut } from "./parseActivityLogs";
import { selectPayoutFromGameData } from "./payoutHelpers";

/**
 * Starting a rumble will:
 * - Get all players, and room info from params
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
    const {data: roomData, error} = await getGameDataFromDb(roomSlug);
    if (!roomData || roomData.params.game_completed || roomData.params.game_started) {
      console.log('---startRumble--ERROR', roomSlug);
      return;
    }
    const { data: activities } = await getAllActivities();
    // RumbleApp expects players = {id, name}
    // TODO: This will potentially be limited to only 1000 results.
    // We need to assure there aren't more than that before starting.
    // Get all current players in case we missed someone in the db when it's started.
    // Or in case they changed their name and we don't see it.

    const data = await prisma.players.findMany({
      where: {
        room_id: roomData.room.id
      },
      select: {
        User: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    // Map the data to what rumble expects
    const initialPlayers = data.map(({ User }) => ({
      id: User.id,
      name: User.name
    }))

    const params: SetupType['params'] = {
      chanceOfPve: roomData.params.pve_chance,
      chanceOfRevive: roomData.params.revive_chance,
    }

    // TODO: Store this giant blob somewhere so we can go over the files later.
    // Autoplay the game
    const finalGameData = await createGame({ activities, params, initialPlayers: initialPlayers as any });

    // Parse the package's activity log to a more usable format to send to client
    const parsedActivityLog = parseActivityLogForClient(finalGameData.gameActivityLogs, roomData.players);

    // Parse the activity log to store it to the db better
    const activitiesInGame = parseActivityLogForDbPut(parsedActivityLog, roomData);
    const activityLogSubmit = await prisma.gameRoundLogs.createMany({
      data: activitiesInGame
    })
    // if (activityLogSubmit.error) {
    //   console.error(activityLogSubmit.error);
    // }

    // Calculate payout info
    const payoutInfo = selectPayoutFromGameData(roomData, finalGameData);
    // Submit all payouts to db
    const payoutSubmit = await prisma.payouts.createMany({
      data: payoutInfo
    })
    // if (payoutSubmit.error) {
    //   console.error(payoutSubmit.error);
    // }

    // Update the rooms
    const updateRoomSubmit = await prisma.rooms.update({
      where: {
        id: roomData.room.id,
      },
      data: {
        Params: {
          update: {
            game_started: true,
            winners: parsedActivityLog.winners.map(winner => winner.id)
          }
        }
      }
    })
    // if (updateRoomSubmit.error) {
    //   console.error(updateRoomSubmit.error);
    // }
    // Set the game started to true.
    roomData.params.game_started = true;

    return parsedActivityLog;
  } catch (error) {
    console.error('Server: startRumble', error);
  }
}
