import { definitions } from "@rumble-raffle-dao/types";
import { PostgrestError } from "@supabase/supabase-js";
import client from "../client";
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