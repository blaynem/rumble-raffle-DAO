import { RoomDataType } from "../../types";
import availableRoomsData from "./roomRumbleData";

export const addNewRoomToMemory = (room: RoomDataType) => {
  const slug = room.slug;
  const roomData: RoomDataType = {
    contract: room.contract,
    gameData: room.gameData || null,
    id: room.id,
    params: room.params,
    players: room.players,
    slug: room.slug,
  }
  availableRoomsData[slug] = roomData;
}