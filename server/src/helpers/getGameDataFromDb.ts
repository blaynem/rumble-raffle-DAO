import { RoomDataType, OmegaRoomInterface } from "@rumble-raffle-dao/types";
import client from "../client";
import { selectRoomInfo } from "./selectRoomInfo";

const omegaFetch = `
id,
players:users!players(public_address, name),
params:params_id(*),
slug,
contract:contract_id(*),
game_started,
game_completed,
created_by,
game_activities: game_round_logs(*, activity:activity_id(*)),
winners
`

export const getGameDataFromDb = async (slug: string): Promise<{ data: RoomDataType[]; error: any; }> => {
  try {
    const { data, error } = await client.from<OmegaRoomInterface>('rooms').select(omegaFetch).eq('slug', slug)
    if (error) {
      return { data: [], error: error }
    }
    if (data.length < 1) {
      return { data: [], error: null }
    }
    const roomToAdd = selectRoomInfo(data[0])
    return { data: [roomToAdd], error: null }
  } catch (error) {
    console.error('Server: Fetch by slug', error);
    return { data: [], error: error }
  }
}