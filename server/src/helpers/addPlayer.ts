import { Prisma } from ".prisma/client";
import { PostgrestError } from "@supabase/supabase-js";
import prisma from "../client-temp";
import availableRoomsData from "./roomRumbleData";

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
  playerData: Pick<Prisma.UsersGroupByOutputType, 'id' | 'name' | 'is_admin' | 'nonce'>
): Promise<{
  data?: Pick<Prisma.PlayersGroupByOutputType, 'room_id' | 'slug' | 'player' | 'time_joined'>;
  error?: PostgrestError | string;
}> => {
  const { roomData } = availableRoomsData[roomSlug];
  if (!roomData) {
    return;
  }
  if (roomData.players.length > 900) {
    return { error: 'reached max players' }
  }

  const data = await prisma.players.create({
    data: { room_id: roomData.id, player: playerData.id, slug: roomSlug }
  })
  // if (error) {
  //   // If error, we return the error.
  //   return { error };
  // }
  // Otherwise add the player to the rumble locally.
  roomData.players.push(playerData);
  return { data }
}