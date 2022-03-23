import { PrizeSplitType, GameEndType } from "@rumble-raffle-dao/rumble"
import { definitions } from ".";

/**
 * We only want to send these fields back to players.
 */
export type PickFromPlayers = Pick<definitions["users"], "public_address" | "name">

export type RoomDataType = {
  // Who the room was created by
  created_by: definitions['rooms']['created_by']
  // Contract data for the given room
  contract: definitions['contracts']
  // Will be null until the game has been played and completed.
  gameData?: GameEndType | null;
  // True if the game has already been started.
  game_started: definitions['rooms']['game_started']
  // Id of the given room.
  id: string;
  // Players of the given room.
  players: PickFromPlayers[];
  // Params of the given room.
  params: definitions['room_params'];
  // Slug for the given room.
  slug: string;
}

export type AllAvailableRoomsType = {
  [slug: string]: RoomDataType;
}
