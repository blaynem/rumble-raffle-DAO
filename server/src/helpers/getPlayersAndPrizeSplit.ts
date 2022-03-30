import { PlayerAndPrizeSplitType } from "@rumble-raffle-dao/types";
import { selectPrizeSplitFromParams } from "./payoutHelpers";
import availableRoomsData from "./roomRumbleData";

export const getPlayersAndPrizeSplit = (roomSlug: string): PlayerAndPrizeSplitType => {
  const room = availableRoomsData[roomSlug];
  if (!room) {
    console.log('---getPlayersAndPrizeSplit--ERROR', roomSlug);
    return;
  }
  const allPlayers = room.players
  const prizeSplit = selectPrizeSplitFromParams(room.params);
  const roomInfo: PlayerAndPrizeSplitType['roomInfo'] = {
    contract: {
      chain_id: room.contract.chain_id,
      contract_address: room.contract.contract_address,
      network_name: room.contract.network_name,
      symbol: room.contract.symbol,
    },
    params: {
      alt_split_address: room.params.alt_split_address,
      created_by: room.params.created_by,
      entry_fee: room.params.entry_fee,
      pve_chance: room.params.pve_chance,
      revive_chance: room.params.revive_chance
    }
  }
  return {
    allPlayers,
    prizeSplit,
    roomInfo
  }
}
