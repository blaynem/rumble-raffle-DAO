import { PlayerType } from "."

export const enum ActivityEnvironment {
  PVE = 'PVE',
  PVP = 'PVP'
}

export interface ActivityTypes {
  // Id of the activity
  id: string;
  // The environment of activity will be either PVE or PVP.
  environment: ActivityEnvironment;
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
}

export type RoundActivityLogType = {
  activity: ActivityTypes;
  activityId: string;
  participants: string[];
  winners: string[] | null;
  losers: string[] | null;
  content: string;
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