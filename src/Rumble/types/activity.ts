import { PlayerType, PrizePayouts } from "."

export interface ActivityTypes {
  // Id of the activity
  id: string;
  // The environment of activity will be either PVE or PVP.
  environment: ('PVP' | 'PVE');
  /**
   * Description of event.
   * Ex: "PLAYER0 killed PLAYER1 with a knife.""
   */
  description: string;
  /**
   * The amount of players allowed in this activity.
   * Ex: 2 total players in example :"PLAYER0 killed PLAYER1 with a knife."
   */
  amountOfPlayers: number;
  /**
   * Who the winner(s) will be of the event.
   * In the example "PLAYER0 killed PLAYER1 with a knife", PLAYER0 will be the winner. So we return the index of the winner.
   * 
   * Will be null if no winner in the event.
   */
  activityWinner: number[] | null;
  /**
   * Who the loser(s) will be of the event.
   * In the example "PLAYER0 killed PLAYER1 with a knife", PLAYER1 will be the loser. So we return the index of the loser.
   * 
   * Will be null if no loser in the event.
   */
  activityLoser: number[] | null;
  /**
   * Kill counts are used to determine how much kill value is given to each participant.
   * 
   * KillCount total value should never be more than the amount of losers.
   * KillCount should be null when no one did the killing.
   * 
   * Examples:
   * - "PLAYER0 killed PLAYER1 with a knife" - [1,0] PLAYER_0 will be given 1 kill, while PLAYER_1 recieves none.
   * - "PLAYER_0 and PLAYER_1 ate PLAYER_2" - [0.5, 0.5, 0] - both PLAYER_0 and PLAYER_1 participated in the kill, while PLAYER_2 is no more.
   */
  killCounts: number[] | null;
}

export type RoundActivityLogType = {
  activity: ActivityTypes;
  activityId: string;
  participants: string[];
  winners: string[] | null;
  losers: string[] | null;
  content: string;
  killCount: { [playerId: string]: number };
}

export type ActivityLogType = {
  id: string;
  roundActivityLog: RoundActivityLogType[];
  roundCounter: number;
  playersRemainingIds: string[];
  playersSlainIds: string[];
}

export type WinnerLogType = {
  id: string;
  playersSlainIds: string[];
  winner: PlayerType;
  winnerId: string;
  runnerUps: PlayerType[];
  runnerUpIds: string[];
}

export type GameEndType = {
  // Activity logs for each round played.
  activityLogs: (ActivityLogType | WinnerLogType)[];
  // Total kills in the game
  gameKills: {[playerId: string]: number};
  // Payouts for the game;
  gamePayouts: PrizePayouts;
  // The game runner ups (2nd / 3rd).
  gameRunnerUps: PlayerType[] | null;
  // The game winner.
  gameWinner: PlayerType | null;
  // What round we are on.
  roundCounter: number;
}