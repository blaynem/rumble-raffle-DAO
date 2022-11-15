import { SetupType } from "@rumble-raffle-dao/rumble/types";
import { DiscordPlayer, EntireGameLog, PickFromPlayers } from "@rumble-raffle-dao/types";
import prisma from "../client";
import { getAllActivities } from "../routes/api/activities";
import { createGame } from "./createRumble";
import { getGameDataFromDb } from "./getGameDataFromDb";
import { parseActivityLogForClient, parseActivityLogForDbPut } from "./parseActivityLogs";
import { selectPayoutFromGameData } from "./payoutHelpers";
import availableRoomsData from "../gameState/roomRumbleData";

/**
 * Starting a rumble will:
 * - Check if any discord players have a user profile
 * - If we match a discord user to their User, we make sure they are added to Players db table
 * - From there we get all User Players and merge with discord players
 * - fetch all activities to play
 * - create the game and play it
 * 
 * - After createGame finishes:
 * - - game payouts to db
 * - - update `rooms` in db with `total_prize_purse`, `game_completed`
 * - - dumps activity logs to supabase bucket
 */
export const startRumble = async (roomSlug: string): Promise<EntireGameLog | { error: any }> => {
  try {
    const { discordPlayers, roomData: localRoomData } = availableRoomsData.getRoom(roomSlug);
    // Find all players who joined via discord emoji, who have their discord ID linked to their public address (id)
    const findDiscordPlayersById = await prisma.users.findMany({
      where: {
        OR: discordPlayers.map(player => ({ discord_id: player.id }))
      },
      select: {
        id: true,
        name: true,
        discord_id: true,
      }
    })
    // Upsert all found Users to the Players db table.
    if (findDiscordPlayersById.length > 0) {
      // Need in a $transaction so we can batch update.
      await prisma.$transaction(
        findDiscordPlayersById.map(player => prisma.players.upsert({
          where: {
            room_params_id_player: {
              room_params_id: localRoomData.params.id,
              player: player.id
            }
          },
          update: {},
          create: {
            room_params_id: localRoomData.params.id,
            player: player.id,
            slug: roomSlug,
          }
        }))
      )
    }

    const foundPlayers = findDiscordPlayersById.map(p => p.discord_id);
    // filter out players we did find from remaining array here
    const notFoundDiscordPlayers = discordPlayers.filter(player => !foundPlayers.includes(player.id))

    // Get game data from db, including all players
    const { data: roomData, error } = await getGameDataFromDb(roomSlug);
    if (!roomData || roomData.params.game_completed || roomData.params.game_started) {
      throw ('There was no room data, or the game has already started and been completed.')
    }
    // Get all activities for the game.
    const { data: activities } = await getAllActivities();

    // Combine players from db + leftover discord players
    const combinedPlayers = [
      ...roomData.players,
      ...notFoundDiscordPlayers
    ]

    // We want to overwrite players so we can get any we might be missing
    const updatedRoomData = { ...availableRoomsData.getRoom(roomSlug) }
    // overwrite players / discordPlayers
    updatedRoomData.roomData.players = combinedPlayers;
    updatedRoomData.discordPlayers = notFoundDiscordPlayers;
    // Update the room
    availableRoomsData.updateRoom(roomSlug, updatedRoomData)

    const params: SetupType['params'] = {
      chanceOfPve: roomData.params.pve_chance,
      chanceOfRevive: roomData.params.revive_chance,
    }

    // format combined players to fit expected object. Add Discord Identifier to name
    const initialPlayers = combinedPlayers.map(p => {
      if ((p as DiscordPlayer).id_origin === 'DISCORD') {
        return {
          id: p.id,
          name: (p as DiscordPlayer).username,
          discord_id: p.id,
        }
      }
      return ({
        id: p.id,
        name: (p as PickFromPlayers).name,
        discord_id: (p as PickFromPlayers).discord_id,
      })
    });
    // Autoplay the game
    // TODO: Store this giant blob somewhere so we can go over the files later.
    const finalGameData = await createGame({ activities, params, initialPlayers: initialPlayers });

    // Parse the package's activity log to a more usable format to send to client
    const parsedActivityLog = parseActivityLogForClient(finalGameData.gameActivityLogs, initialPlayers);

    // Parse the activity log to store it to the db better
    const activitiesInGame = parseActivityLogForDbPut(parsedActivityLog, roomData);
    const activityLogSubmit = await prisma.gameRoundLogs.createMany({
      data: activitiesInGame
    })

    // Calculate payout info
    const payoutInfo = selectPayoutFromGameData(roomData, finalGameData);
    // Submit all payouts to db
    const payoutSubmit = await prisma.payouts.createMany({
      data: payoutInfo
    })

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
    return { error: error }
  }
}
