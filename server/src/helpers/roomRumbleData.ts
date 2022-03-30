import { AllAvailableRoomsType, GameState, RoomDataType } from "@rumble-raffle-dao/types";

const availableRoomsData: AllAvailableRoomsType = {};

// defaults for the game state
export const defaultGameState = {
  gameCompleted: false,
  roundCounter: 0,
  showWinners: false,
  waitTime: 15,
};

const getGameState = (room: RoomDataType): GameState => {
  // If the game has completed from the db, we set it to started here as well
  // Also set the roundCounter to round length in order to show all the rounds.
  if (room.game_completed) {
    return {
      gameCompleted: true,
      roundCounter: room.gameData.rounds.length,
      showWinners: true,
      waitTime: defaultGameState.waitTime,
    }
  }
  return defaultGameState;
}

export const addNewRoomToMemory = (room: RoomDataType) => {
  const slug = room.slug;
  const roomData: RoomDataType = {
    ...room,
    gameData: room.gameData || null,
  }
  availableRoomsData[slug] = {
    roomData,
    gameState: getGameState(room),
  };
}

export default availableRoomsData;