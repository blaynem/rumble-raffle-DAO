import { definitions } from "./supabase";
import { PrizeSplitType } from "@rumble-raffle-dao/rumble";

// All players, the prize split, and the necessary room info
export type PlayerAndPrizeSplitType = {
  allPlayers: PickFromPlayers[];
  prizeSplit: PrizeSplitType;
  // Creator, entryFee, tokenContract, tokenNetwork
  roomInfo: {
    contract: Pick<definitions['contracts'], 'contract_address' | 'network_name' | 'symbol' | 'chain_id'>;
    params: Pick<definitions['room_params'], 'alt_split_address' | 'created_by' | 'entry_fee' | 'pve_chance' | 'revive_chance'>;
  }
}

// Used to hold all the available rooms inside the server
export type AllAvailableRoomsType = {
  [slug: string]: {
    roomData: RoomDataType;
    gameState: GameState;
  };
}

// /**
//  * The combination of room data and the games current state.
//  */
//  export type RoomDataAndGameState = RoomDataType & GameState;

/**
 * The current state of the game. How many rounds have been shown, etc.
 */
export type GameState = {
  /**
   * True if the game has been completed.
   */
  gameCompleted: boolean;
  /**
   * How many rounds of the game should be shown.
   */
  roundCounter: number;
  /**
   * True if the winners should be shown to the players.
   */
  showWinners: boolean;
  /**
   * Wait time, in seconds, between displaying the next round.
   */
  waitTime: number;
}

// Payouts type omitting the id
export type PayoutsOmitId = Omit<definitions["payouts"], 'id'>;

/**
 * Used for creating payouts
 */
export type PayoutTemplateType = {
  /**
   * Room data
   */
  room: RoomDataType;
  /**
   * Players public address
   */
  public_address: string;
  /**
   * Payment amount 
   */
  payment_amount: number;
  /**
   * Reason for the payment
   */
  payment_reason: definitions['payouts']['payment_reason'];
  /**
   * Notes to help determine reason later
   */
  notes: definitions['payouts']['notes']
}

/**
 * We only want to send these fields back to players.
 */
export type PickFromPlayers = Pick<definitions["users"], "public_address" | "name">

// Used for creating rooms
export type RoomDataType = {
  /**
   * Who the room was created by
   */
  created_by: definitions['rooms']['created_by']
  /**
   * Contract data for the given room
   */
  contract: definitions['contracts']
  /**
   * Will be null until the game has been played and completed.
   */
  gameData?: EntireGameLog | null;
  /**
   * True if the game has been completed.
   */
  game_completed: definitions['rooms']['game_completed']
  /**
   * True if the game has already begun playing.
   */
  game_started: definitions['rooms']['game_started'];
  /**
   * Id of the given room.
   */
  id: string;
  /**
   * Players of the given room.
   */
  players: PickFromPlayers[];
  /**
   * Params of the given room.
   */
  params: definitions['room_params'];
  /**
   * Slug for the given room.
   */
  slug: string;
}

// Only get the public_address and name field from users db
export type PickFromUsers = Pick<definitions['users'], 'public_address' | 'name'>;

// Used for a single round within a game
export type RoundsType = {
  activity: definitions['activities']
} & definitions['game_round_logs']

// Type used to initialize the server with any / all rooms available.
export type OmegaRoomInterface = {
  players: PickFromUsers[];
  params: definitions['room_params'];
  contract: definitions['contracts'];
  game_activities: RoundsType[];
} & Pick<definitions['rooms'], 'id' | 'slug' | 'game_completed' | 'game_started' | 'created_by' | 'winners'>

// All of the game_round_logs types, omitting the id
export type GameRoundLogsOmitId = Omit<definitions['game_round_logs'], 'id'>

// The entire games log.
export type EntireGameLog = {
  rounds: RoundActivityLog[];
  winners: PickFromPlayers[];
}

// The collection of activities that happens in a given game.
export type RoundActivityLog = {
  /**
   * Activities that have happened in this round.
   */
  activities: SingleActivity[];
  /**
   * What round of the acitvity log this is.
   */
  round_counter: number;
  /**
   * Amount of players remaining.
   */
  players_remaining: number;
}

// A single activity that happens in a given round.
export type SingleActivity = {
  activity_order: number;
  /**
   * Description of the activity that happens. Ex: "PLAYER_0 drank infected water and died."
   */
  description: definitions['activities']['description'];
  /**
   * Whether it is PVE, PVP, or REVIVE 
   */
  environment: definitions['activities']['environment']
  /**
   * Id of the activity
   */
  id: definitions['activities']['id'];
  /**
   * Kill count for each activity
   */
  kill_count: { [playerId: string]: number }
  /**
   * Participants of the activity
   */
  participants: PickFromPlayers[];
}
