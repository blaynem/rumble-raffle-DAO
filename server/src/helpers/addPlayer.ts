import { Prisma } from '.prisma/client'
import prisma from '../client'
import availableRoomsData from '../gameState/roomRumbleData'

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
export const addPlayer = async (
  roomSlug: string,
  playerData: Pick<Prisma.UsersGroupByOutputType, 'id' | 'name' | 'discord_id'>
): Promise<{
  data?: Pick<Prisma.PlayersGroupByOutputType, 'room_params_id' | 'slug' | 'player' | 'time_joined'>
  error?: string
}> => {
  const room = availableRoomsData.getRoom(roomSlug)
  if (!room) {
    return { error: "Room doesn't exist." }
  }
  const { roomData } = room
  if (roomData.players.length > 900) {
    return { error: 'reached max players' }
  }

  const data = await prisma.players.create({
    data: { room_params_id: roomData.room.params_id, player: playerData.id, slug: roomSlug }
  })
  // if (error) {
  //   // If error, we return the error.
  //   return { error };
  // }
  // Otherwise add the player to the rumble locally.
  roomData.players.push(playerData)
  return { data }
}
