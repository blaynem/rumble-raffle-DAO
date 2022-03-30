import { AllAvailableRoomsType, RoomDataType } from "@rumble-raffle-dao/types";

const availableRoomsData: AllAvailableRoomsType = {};

// defaults for the game state
const defaultGameState = {
  gameCompleted: false,
  roundCounter: 0,
  showWinners: false,
  waitTime: 15,
};

export const addNewRoomToMemory = (room: RoomDataType) => {
  const slug = room.slug;
  const roomData: RoomDataType = {
    ...room,
    gameData: room.gameData || null,
  }
  availableRoomsData[slug] = {
    roomData,
    gameState:defaultGameState
  };
}

export default availableRoomsData;