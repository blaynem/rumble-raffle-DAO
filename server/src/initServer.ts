import { RoomDataType } from "../types";
import client from "./client";
import availableRoomsData from "./roomRumbleData";


// todo: fetch all rooms from db and create the games inside roomRumbleData.
// todo: check if game was already completed and has stored activity log / winner data.
const InitializeServer = async () => {
  const { data, error } = await client.from<RoomDataType>('rooms').select(`
    id,
    players:users!players(publicAddress, name),
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

export const addNewRoomToMemory = (room: RoomDataType) => {
  const slug = room.slug;
  const roomData: RoomDataType = {
    gameData: room.gameData || null,
    id: room.id,
    params: room.params,
    players: room.players,
    slug: room.slug,
  }
  availableRoomsData[slug] = roomData;
}

export default InitializeServer