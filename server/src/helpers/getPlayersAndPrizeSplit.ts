import { PlayerAndPrizeSplitType } from "@rumble-raffle-dao/types";
import { selectPrizeSplitFromParams } from "./payoutHelpers";
import availableRoomsData from "./roomRumbleData";

export const getPlayersAndPrizeSplit = (roomSlug: string): PlayerAndPrizeSplitType => {
  const {roomData} = availableRoomsData[roomSlug];
  if (!roomData) {
    console.log('---getPlayersAndPrizeSplit--ERROR', roomSlug);
    return;
  }
  const allPlayers = roomData.players
  const prizeSplit = selectPrizeSplitFromParams(roomData.params);
  const roomInfo: PlayerAndPrizeSplitType['roomInfo'] = {
    contract: {
      chain_id: roomData.contract.chain_id,
      contract_address: roomData.contract.contract_address,
      network_name: roomData.contract.network_name,
      symbol: roomData.contract.symbol,
    },
    params: {
      alt_split_address: roomData.params.alt_split_address,
      created_by: roomData.params.created_by,
      entry_fee: roomData.params.entry_fee,
      pve_chance: roomData.params.pve_chance,
      revive_chance: roomData.params.revive_chance
    }
  }
  return {
    allPlayers,
    prizeSplit,
    roomInfo
  }
}
