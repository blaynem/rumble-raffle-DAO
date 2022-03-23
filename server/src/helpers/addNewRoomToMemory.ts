import { RoomDataType } from "../../types";
import availableRoomsData from "./roomRumbleData";

// TODO: Determine if we should fetch all the game data or not?
export const addNewRoomToMemory = (room: RoomDataType) => {
  const slug = room.slug;
  const roomData: RoomDataType = {
    ...room,
    gameData: room.gameData || null,
  }
  availableRoomsData[slug] = roomData;
}