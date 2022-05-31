import { Prisma } from '.prisma/client'

// All players, and the necessary room info
export type PlayerAndRoomInfoType = {
  allPlayers: PickFromPlayers[];
  // Creator, tokenContract, tokenNetwork
  roomInfo: {
    contract: Pick<Prisma.ContractsGroupByOutputType, 'contract_address' | 'network_name' | 'symbol' | 'chain_id'>;
    params: Pick<Prisma.RoomParamsGroupByOutputType, 'created_by' | 'pve_chance' | 'revive_chance'>;
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
export type PayoutsOmitId = Omit<Prisma.PayoutsGroupByOutputType, 'id' | 'created_at' | '_count' | '_avg' | '_sum' | '_min' | '_max'>

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
  payment_amount: Prisma.PayoutsGroupByOutputType['payment_amount'];
  /**
   * Reason for the payment
   */
  payment_reason: Prisma.PayoutsGroupByOutputType['payment_reason'];
  /**
   * Notes to help determine reason later
   */
  notes: Prisma.PayoutsGroupByOutputType['notes']
}

/**
 * We only want to send these fields back to players.
 */
export type PickFromPlayers = Pick<Prisma.UsersGroupByOutputType, 'id' | 'name'>

export interface RoomDataType {
  room: Pick<Prisma.RoomsGroupByOutputType, 'id' | 'slug' | 'params_id'>
  params: Pick<Prisma.RoomParamsGroupByOutputType, 'game_completed' | 'game_started' | 'id' | 'pve_chance' | 'revive_chance' | 'winners' | 'created_by'>
  players: PickFromPlayers[]
  gameLogs: (
    Pick<Prisma.GameRoundLogsGroupByOutputType, 'activity_id' | 'round_counter' | 'activity_order' | 'participants' | 'players_remaining'>
    & {
      Activity: Pick<Prisma.ActivitiesGroupByOutputType, 'activityLoser' | 'activityWinner' | 'killCounts' | 'environment' | 'amountOfPlayers' | 'description'>
    }
  )[]
  contract: Omit<Prisma.ContractsGroupByOutputType, '_count' | '_min' | '_max' | '_avg' | '_sum' | 'created_at' | 'updated_at'>
  gameData: EntireGameLog | null;
}

// Used for a single round within a game
export type RoundsType = (
  Pick<Prisma.GameRoundLogsGroupByOutputType, 'activity_id' | 'round_counter' | 'activity_order' | 'participants' | 'players_remaining'>
  & {
    Activity: Pick<Prisma.ActivitiesGroupByOutputType, 'activityLoser' | 'activityWinner' | 'killCounts' | 'environment' | 'amountOfPlayers' | 'description'>
  }
)

// All of the game_round_logs types, omitting the id
export type GameRoundLogsOmitId = Omit<Prisma.GameRoundLogsGroupByOutputType, 'id' | 'created_at' | '_count' | '_avg' | '_sum' | '_min' | '_max'>

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
  description: Prisma.ActivitiesGroupByOutputType['description'];
  /**
   * Whether it is PVE, PVP, or REVIVE 
   */
  environment: Prisma.ActivitiesGroupByOutputType['environment']
  /**
   * Id of the activity
   */
  id: Prisma.ActivitiesGroupByOutputType['id'];
  /**
   * Kill count for each activity
   */
  kill_count: { [playerId: string]: Prisma.Decimal }
  /**
   * Participants of the activity
   */
  participants: PickFromPlayers[];
}

export interface CreateRoom {
  slug: Prisma.RoomsCreateInput['slug']
  params: Omit<Prisma.RoomParamsCreateInput, 'Creator' | 'Contract'>
  contract_address: Prisma.ContractsCreateInput['contract_address']
  createdBy: Prisma.UsersCreateInput['id']
}

export type IronSessionUserData = Pick<Prisma.UsersGroupByOutputType, 'id' | 'name' | 'is_admin'> & { signature: string; };