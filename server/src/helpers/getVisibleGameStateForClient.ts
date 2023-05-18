import { RoomDataType, GameState, EntireGameLog } from '@rumble-raffle-dao/types'

/**
 * Only returns the current game state that the client should be able to see.
 *
 * @param roomData
 * @param gameState
 * @returns
 */
export const getVisibleGameStateForClient = (
  { gameData }: RoomDataType,
  { gameCompleted, showWinners, roundCounter }: GameState
): {
  visibleRounds: EntireGameLog['rounds']
  winners: EntireGameLog['winners']
} => {
  const winners = gameCompleted && showWinners ? gameData!.winners : []
  const rounds = gameData!.rounds.slice(0, roundCounter)
  return {
    visibleRounds: rounds,
    winners
  }
}
