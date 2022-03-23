import { definitions, RoomDataType } from "../../types";
import client from "../client";
import { addNewRoomToMemory } from "./addNewRoomToMemory";

type OmegaRoomInterface = {
  players: definitions['users'][];
  params: definitions['room_params'];
  contract: definitions['contracts'];
} & definitions['rooms']

// todo: check if game was already completed and has stored activity log / winner data.
const InitializeServer = async () => {
  const { data, error } = await client.from<OmegaRoomInterface>('rooms').select(`
    id,
    players:users!players(public_address, name),
    params:params_id(*),
    slug,
    contract:contract_id(*),
    game_started,
    created_by
    `)
  if (error) {
    console.error('---error', error);
    return;
  }
  data.forEach(room => {
    addNewRoomToMemory(room);
  })
}



export default InitializeServer