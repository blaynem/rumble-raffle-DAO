import { PrizeSplitType, GameEndType } from "@rumble-raffle-dao/rumble"
import { definitions } from ".";

// TODO: Add a winner table and split information

/**
 * We only want to send these fields back to players.
 */
export type PickFromPlayers = Pick<definitions["users"], "publicAddress" | "name">

export type RoomDataType = {
  // Will be null until the game has been played and completed.
  gameData: GameEndType | null;
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
