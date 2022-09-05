import { AllAvailableRoomsType, GameState, RoomDataType } from "@rumble-raffle-dao/types";

// defaults for the game state
export const defaultGameState = {
  gameCompleted: false,
  roundCounter: 0,
  showWinners: false,
  waitTime: 15,
};

// TODO: Reduce this down, a lot of this information can come straight from the db instead of sockets
class AvailableRoomsData {
  private rooms: Map<string, AllAvailableRoomsType> = new Map();
  constructor() {
    this.rooms = new Map();
  }

  // Adds new room to available rooms.
  addRoom = (data: RoomDataType) => {
    const slug = data.room.slug;
    // new room data
    const roomData: RoomDataType = {
      ...data,
      gameData: data.gameData || null,
    }

    this.rooms.set(slug, {
      freePlayers: [],
      roomData,
      gameState: this.getGameState(data),
    })
  }

  getRoom = (slug: string) => {
    return this.rooms.get(slug)
  }

  getGameState = (data: RoomDataType): GameState => {
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

  updateRoom = (slug: string, data: AllAvailableRoomsType) => {
    // new room data
    this.rooms.set(slug, data);
  }
}

const availableRoomsData = new AvailableRoomsData();

export default availableRoomsData;