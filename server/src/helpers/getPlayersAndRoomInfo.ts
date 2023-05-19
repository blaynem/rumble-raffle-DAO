import { PlayerAndRoomInfoType } from '@rumble-raffle-dao/types'
import availableRoomsData from '../gameState/roomRumbleData'

export const getPlayersAndRoomInfo = (roomSlug: string): PlayerAndRoomInfoType | null => {
  const room = availableRoomsData.getRoom(roomSlug)
  if (!room) {
    console.log('---getPlayersAndRoomInfo--ERROR', roomSlug)
    return null
  }
  const { roomData } = room
  const allPlayers = roomData.players
  const roomInfo: PlayerAndRoomInfoType['roomInfo'] = {
    contract: {
      chain_id: roomData.contract.chain_id,
      contract_address: roomData.contract.contract_address,
      network_name: roomData.contract.network_name,
      symbol: roomData.contract.symbol
    },
    params: {
      created_by: roomData.params.created_by,
      pve_chance: roomData.params.pve_chance,
      revive_chance: roomData.params.revive_chance,
      id: roomData.params.id
    }
  }
  return {
    allPlayers,
    roomInfo
  }
}
