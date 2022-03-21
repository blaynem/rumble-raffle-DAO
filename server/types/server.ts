import { PrizeSplitType, GameEndType } from "@rumble-raffle-dao/rumble"
import { definitions } from ".";

export type PickFromPlayers = Pick<definitions["users"], "publicAddress" | "name">
export type PickFromRooms = Pick<definitions["rooms"], "id" | "slug" | "params">

export type RoomUsersUnionType = {
  players?: definitions["users"][];
  params: any;
} & PickFromRooms

export type RoomWithParams = {
  params: {
    prizeSplit: PrizeSplitType;
  }
} & PickFromRooms

export type RoomDataType = {
  players: PickFromPlayers[];
  gameData?: GameEndType;
} & RoomWithParams

export type AllAvailableRoomsType = {
  [slug: string] : RoomDataType;
}

/** TYPES BELOW HERE ARE UNTIL WE FIGURE OUT  */

// export type SupabaseUserType = {
//   id: string;
//   publicAddress: string;
//   nonce: string;
//   name: string;
// }

// export type SupabaseRoomType = {
//   slug: string;
//   params: {
//     prizeSplit: PrizeSplitType;
//   }
//   id: string;
// }

// export type SupabaseRoomExtendPlayers = {
//   players?: SupabaseUserType[]
// } & SupabaseRoomType;

// export type SupabasePlayersType = {
//   room_id: string;
//   player_id: string;
// }

