import { PrizeSplitType } from "@rumble-raffle-dao/rumble";

export type SupabaseUserType = {
  id: string;
  publicAddress: string;
  nonce: string;
  name: string;
}

export type SupabaseRoomType = {
  slug: string;
  params: {
    prizeSplit: PrizeSplitType;
  }
  id: string;
}

export type SupabaseRoomExtendPlayers = {
  players?: SupabaseUserType[]
} & SupabaseRoomType;

export type SupabasePlayersType = {
  room_id: string;
  player_id: string;
}

export type PostgrestError = {
  message: string
  details: string
  hint: string
  code: string
}