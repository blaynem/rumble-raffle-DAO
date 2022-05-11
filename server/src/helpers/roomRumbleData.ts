import { AllAvailableRoomsType, GameState, RoomDataType } from "@rumble-raffle-dao/types";

// TODO: Reduce this down, a lot of this information can come straight from the db instead of sockets
const availableRoomsData: AllAvailableRoomsType = {};

// defaults for the game state
export const defaultGameState = {
  gameCompleted: false,
  roundCounter: 0,
  showWinners: false,
  waitTime: 2,
};

const getGameState = (data: RoomDataType): GameState => {
  // If the game has completed from the db, we set it to started here as well
  // Also set the roundCounter to round length in order to show all the rounds.
  if (data.params.game_completed) {
    return {
      gameCompleted: true,
      roundCounter: data.gameData.rounds.length,
      showWinners: true,
      waitTime: defaultGameState.waitTime,
    }
  }
  return defaultGameState;
}

export const addNewRoomToMemory = (data: RoomDataType) => {
  const slug = data.room.slug;
  const roomData: RoomDataType = {
    ...data,
    gameData: data.gameData || null,
  }
  availableRoomsData[slug] = {
    roomData,
    gameState: getGameState(data),
  };
}

export default availableRoomsData;