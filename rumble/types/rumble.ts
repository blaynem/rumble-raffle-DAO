import { ActivityTypes, PrizeValuesType, allPlayersObj, ActivityLogType, WinnerLogType, PrizePayouts, PlayerType, GameEndType, PrizeSplitType, ActivitiesObjType } from ".";

/**
 * Constructor typings
 */
export type SetupType = {
  activities: ActivitiesObjType,
  initialPlayers: PlayerType[],
  prizeSplit: PrizeSplitType,
}

/**
 * Allows the setup of constructor variable types.
 */
export interface RumbleRaffleInterface {
  new(setup: SetupType): RumbleInterface;
}


/**
 * Interface of the instantiated Rumble.
 */
export interface RumbleInterface {
  /**
   * Activities available to choose from.
   */
  activities: ActivitiesObjType;

  /** ----Values for setting up the rumble environment---- */
  /**
   * Percent chance of a PVE random. Must be between 0 and 100.
   * Default is 30%
   */
  chanceOfPve: number;
  /**
   * Percent chance of someone to revive. Must be between 0 and 100.
   * Default is 5%
   */
  chanceOfRevive: number;
  // Price in order to join the rumble
  entryPrice: number;
  // Prize values that will be given
  prizes: PrizeValuesType;
  /**
   * The maximum amount of activities a user should be able to participate in each round.
   * Excluding revives.
   * Default is 2.
   */
  maxActivitiesPerRound: number;

  /** ----Values used before game starts---- */

  // All players of the given game as an object.
  allPlayers: allPlayersObj;
  // All player ids of the given game as an array.
  allPlayerIds: string[];
  // Total amount of players
  totalPlayers: number;
  // Total prize to be split
  totalPrize: number;

  /** ----Values used when game in play--- */

  // Storing the activity logs for each round played.
  activityLogs: (ActivityLogType | WinnerLogType)[];
  // Total kills in the game
  gameKills: { [playerId: string]: number };
  // Payouts for the game;
  gamePayouts: PrizePayouts;
  // The game runner ups (2nd / 3rd).
  gameRunnerUps: PlayerType[];
  // Has game already been started.
  gameStarted: boolean;
  // The game winner.
  gameWinner: PlayerType | null;
  // All players still in the game
  playersRemainingIds: string[];
  // Players who have been slain.
  playersSlainIds: string[];
  // What round we are on.
  roundCounter: number;

  /** ----FUNCTIONS--- */

  /**
   * On add player we want to:
   * - Add the player ID to playersRemainingIds arr
   * - Add player to allPlayers object
   * - Call setPlayers method
   * @param newPlayer 
   * @returns 
   */
  addPlayer: (newPlayer: PlayerType) => PlayerType[] | null;
  /**
   * Clears all players from the game state.
   */
  clearPlayers: () => void;
  /**
   * Get's the entire class for debuggin.
   */
  debug: () => any;
  /**
   * Getter for the activity logs.
   * @returns activity logs
   */
  getActivityLog: () => (ActivityLogType | WinnerLogType)[]
  /**
   * Get all players in the game
   */
  getAllPlayers: () => PlayerType[];
  /**
   * Getter for the game winner and runner ups.
   * @returns the game winner and runner ups.
   */
  getGameWinner: () => { winner: PlayerType | null, runnerUps: PlayerType[] | null }
  /**
   * Getter for the prize information.
   * @returns all prizes
   */
  getPrizes: () => PrizeValuesType;
  /**
   * Gets the player object by the id
   * @param id - id of player
   * @returns player object
   */
  getPlayerById: (id: string) => PlayerType;
  /**
   * Remove a player from the rumble.
   * @param playerId - playerID to remove
   * @returns - the remaining players
   */
  removePlayer: (playerId: string) => PlayerType[] | null;
  /**
   * Helper that replaces the "PLAYER_#" placeholders in activity description with the actual players name.
   * @param activity - given activity
   * @param playerIds - player ids completing the activity
   * @returns the activity description string
   */
  replaceActivityDescPlaceholders: (activity: ActivityTypes, playerIds: string[]) => string
  /**
   * Clears all the activity logs and restarts the game.
   * Keeps all players entered.
   */
  restartGame: () => Promise<GameEndType>;
  /**
   * Will complete the game by itself without needing to press next rounds, etc.
   */
  startAutoPlayGame: () => Promise<GameEndType>;
}