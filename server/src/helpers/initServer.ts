import { addNewRoomToMemory } from "./roomRumbleData";
import client from "../client";
import { OmegaRoomInterface } from '@rumble-raffle-dao/types';
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

// todo: check if game was already completed and has stored activity log / winner data.
const InitializeServer = async () => {
  try {
    // TODO: Limit by games that haven't completed yet.
    const { data, error } = await client.from<OmegaRoomInterface>('rooms')
      .select(omegaFetch)
      .eq('game_completed', false)
    if (error) {
      console.error('---error', error);
      return;
    }
    data.forEach(room => {
      const roomToAdd = selectRoomInfo(room)
      addNewRoomToMemory(roomToAdd);
    })
  } catch (error) {
    console.error('Server: InitializeServer', error);
  }
}



export default InitializeServer