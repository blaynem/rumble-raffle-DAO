import { RoomDataType } from "@rumble-raffle-dao/types";
import { selectRoomInfo } from "../selectRoomInfo";

/**
 * Basically a replica of of the non-free version except we don't make any API calls.
 */
export const getMockRoomData = (slug: string, pve_chance: number, revive_chance: number): RoomDataType => {
  const data = {
    slug,
    id: 'FREE_ID',
    params_id: 'FREE_PARAMS_ID',
    Params: {
      pve_chance,
      revive_chance,
      id: 'FREE_PARAMS_ID',
      winners: [],
      game_started: false,
      game_completed: false,
      created_by: '',
      Players: [],
      GameLogs: [],
      Contract: {
        contract_address: 'FREE_CONTRACT_ADDR',
        chain_id: 137,
        created_at: "2022-05-11T22:59:15.000Z",
        updated_at: "2022-05-11T22:59:15.000Z",
        name: 'FREE RR GAME',
        symbol: 'FREE',
        decimals: '18',
        network_name: 'FREE_NETWORK'
      }
    }
  }

  const { Params: { Players, GameLogs, Contract, ...restParams }, ...restRoomData } = data
  const roomInfo: RoomDataType = {
    room: restRoomData,
    params: restParams,
    players: Players.map(player => player.User),
    gameLogs: GameLogs,
    gameData: null,
    contract: Contract
  }
  return selectRoomInfo(roomInfo)
}