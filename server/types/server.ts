import { RumbleInterface } from "@rumble-raffle-dao/rumble"

export type RoomRumbleDataType = {
  [slug: string]: {
    rumble: RumbleInterface,
    id: string,
    slug: string
  }
}

/** TYPES BELOW HERE ARE UNTIL WE FIGURE OUT  */
import { PrizeSplitType } from "@rumble-raffle-dao/rumble";

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

