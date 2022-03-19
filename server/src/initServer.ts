import { RoomDataType, RoomUsersUnionType } from "../types";
import client from "./client";
import availableRoomsData from "./roomRumbleData";


// todo: fetch all rooms from db and create the games inside roomRumbleData.
// todo: check if game was already completed and has stored activity log / winner data.
const InitializeServer = async () => {
  const { data, error } = await client.from<RoomUsersUnionType>('rooms').select(`
    id,
    slug,
    params,
    players:users!players(publicAddress, name)
  `)
  if (error) {
    console.log('---error', error);
    return;
  }
  data.forEach(room => {
    addNewRoomToMemory(room);
  })
}

export const addNewRoomToMemory = (room: RoomUsersUnionType) => {
  const slug = room.slug;
  const roomData: RoomDataType = {
    id: room.id,
    params: room.params,
    players: room.players,
    slug: room.slug,
  }
  availableRoomsData[slug] = roomData;
}

export default InitializeServer