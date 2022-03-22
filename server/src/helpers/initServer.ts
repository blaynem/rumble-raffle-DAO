import { RoomDataType } from "../../types";
import client from "../client";
import { addNewRoomToMemory } from "./addNewRoomToMemory";

// todo: check if game was already completed and has stored activity log / winner data.
const InitializeServer = async () => {
  const { data, error } = await client.from<RoomDataType>('rooms').select(`
    id,
    players:users!players(public_address, name),
    params:params_id(*),
    slug
    `)
  if (error) {
    console.log('---error', error);
    return;
  }
  data.forEach(room => {
    addNewRoomToMemory(room);
  })
}



export default InitializeServer