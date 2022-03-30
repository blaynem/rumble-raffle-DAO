import { AllAvailableRoomsType, RoomDataType } from "@rumble-raffle-dao/types";

const availableRoomsData: AllAvailableRoomsType = {};

export const addNewRoomToMemory = (room: RoomDataType) => {
  const slug = room.slug;
  const roomData: RoomDataType = {
    ...room,
    gameData: room.gameData || null,
  }
  availableRoomsData[slug] = roomData;
}

export default availableRoomsData;