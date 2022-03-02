import { ActivityTypes, PrizeValuesType, allPlayersObj, ActivityLogType, WinnerLogType, PrizePayouts, PlayerType } from ".";

export interface RumbleInterface {
  activities: ActivityTypes[]
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

  // All players of the given game as an object.
  allPlayers: allPlayersObj;
  // All player ids of the given game as an array.
  allPlayerIds: string[];
  // Total amount of players
  totalPlayers: number;
  // Total prize to be split
  totalPrize: number;

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
}