import { DiscordPlayer, EntireGameLog } from '@rumble-raffle-dao/types'
import { createGame } from '../createRumble'
import { parseActivityLogForClient } from '../parseActivityLogs'
import availableRoomsData from '../../gameState/roomRumbleData'
import { getAllActivities } from '../../routes/api/activities'
// import { freeActivities } from './freeActivities'

/**
 * This is for the free Start of rumble so it doesn't hit the server.
 */
export const startRumbleFree = async (
  roomSlug: string
): Promise<EntireGameLog | { error: any }> => {
  try {
    const room = availableRoomsData.getRoom(roomSlug)
    if (!room) {
      throw Error('There was no room found.')
    }

    const { discordPlayers, roomData } = room
    // Fetch all non-custom activities + all specific guilds activities
    const activityFetch = await getAllActivities(roomSlug)
    if (!activityFetch || !activityFetch.data) {
      throw Error('Activity fetch failed.')
    }
    const { data: activities } = activityFetch

    // format combined players to fit expected object. Add Discord Identifier to name
    const initialPlayers = discordPlayers.map((p: DiscordPlayer) => ({
      id: p.id,
      name: p.username,
      discord_id: p.id
    }))
    // Autoplay the game
    const finalGameData = await createGame({
      activities,
      initialPlayers,
      params: {
        chanceOfPve: roomData.params.pve_chance,
        chanceOfRevive: roomData.params.revive_chance
      }
    })

    // Parse the package's activity log to a more usable format to send to client
    const parsedActivityLog = parseActivityLogForClient(
      finalGameData.gameActivityLogs,
      initialPlayers
    )

    // Set the game started to true.
    roomData.params.game_started = true

    return parsedActivityLog
  } catch (error) {
    return { error: error }
  }
}
