import { Prisma } from '.prisma/client'

// All players, and the necessary room info
export type PlayerAndRoomInfoType = {
  allPlayers: (PickFromPlayers | DiscordPlayer)[]
  // Creator, tokenContract, tokenNetwork
  roomInfo: {
    contract: Pick<
      Prisma.ContractsGroupByOutputType,
      'contract_address' | 'network_name' | 'symbol' | 'chain_id'
    >
    params: Pick<
      Prisma.RoomParamsGroupByOutputType,
      'created_by' | 'pve_chance' | 'revive_chance' | 'id'
    >
  }
}

// Used to hold all the available rooms inside the server
export type AllAvailableRoomsType = {
  // players who joined via emoji click (may be duplicates)
  discordPlayers: DiscordPlayer[]
  roomData: RoomDataType
  gameState: GameState
}

export type DiscordPlayer = {
  /**
   * Username of the given free player.
   */
  username: string
  /**
   * Id of the given free player.
   */
  id: string
  /**
   * Where the free player joined from, example being discord or website.
   *
   * Options: 'DISCORD', 'WEB'
   * Note: 'WEB' not currently used.
   */
  id_origin: 'DISCORD' | 'WEB'
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
  gameCompleted: boolean
  /**
   * How many rounds of the game should be shown.
   */
  roundCounter: number
  /**
   * True if the winners should be shown to the players.
   */
  showWinners: boolean
  /**
   * Wait time, in seconds, between displaying the next round.
   */
  waitTime: number
}

// Payouts type omitting the id
export type PayoutsOmitId = Omit<
  Prisma.PayoutsGroupByOutputType,
  'id' | 'created_at' | '_count' | '_avg' | '_sum' | '_min' | '_max'
>

/**
 * Used for creating payouts
 */
export type PayoutTemplateType = {
  /**
   * Room data
   */
  room: RoomDataType
  /**
   * Players public address
   */
  public_address: string
  /**
   * Payment amount
   */
  payment_amount: Prisma.PayoutsGroupByOutputType['payment_amount']
  /**
   * Reason for the payment
   */
  payment_reason: Prisma.PayoutsGroupByOutputType['payment_reason']
  /**
   * Notes to help determine reason later
   */
  notes: Prisma.PayoutsGroupByOutputType['notes']
}

/**
 * We only want to send these fields back to players.
 */
export type PickFromPlayers = Pick<Prisma.UsersGroupByOutputType, 'id' | 'name' | 'discord_id'>

export interface RoomDataType {
  room: Pick<Prisma.RoomsGroupByOutputType, 'id' | 'slug' | 'params_id'>
  params: Pick<
    Prisma.RoomParamsGroupByOutputType,
    | 'game_completed'
    | 'game_started'
    | 'id'
    | 'pve_chance'
    | 'revive_chance'
    | 'winners'
    | 'created_by'
  >
  players: (PickFromPlayers | DiscordPlayer)[]
  gameLogs: (Pick<
    Prisma.GameRoundLogsGroupByOutputType,
    'activity_id' | 'round_counter' | 'activity_order' | 'participants' | 'players_remaining'
  > & {
    Activity: Pick<
      Prisma.ActivitiesGroupByOutputType,
      | 'activityLoser'
      | 'activityWinner'
      | 'killCounts'
      | 'environment'
      | 'amountOfPlayers'
      | 'description'
    >
  })[]
  contract: Omit<
    Prisma.ContractsGroupByOutputType,
    '_count' | '_min' | '_max' | '_avg' | '_sum' | 'created_at' | 'updated_at'
  >
  gameData: EntireGameLog | null
}

// Used for a single round within a game
export type RoundsType = Pick<
  Prisma.GameRoundLogsGroupByOutputType,
  'activity_id' | 'round_counter' | 'activity_order' | 'participants' | 'players_remaining'
> & {
  Activity: Pick<
    Prisma.ActivitiesGroupByOutputType,
    | 'activityLoser'
    | 'activityWinner'
    | 'killCounts'
    | 'environment'
    | 'amountOfPlayers'
    | 'description'
  >
}

// All of the game_round_logs types, omitting the id
export type GameRoundLogsOmitId = Omit<
  Prisma.GameRoundLogsGroupByOutputType,
  'id' | 'created_at' | '_count' | '_avg' | '_sum' | '_min' | '_max'
>

// The entire games log.
export type EntireGameLog = {
  rounds: RoundActivityLog[]
  winners: (PickFromPlayers | DiscordPlayer)[]
}

// The collection of activities that happens in a given game.
export type RoundActivityLog = {
  /**
   * Activities that have happened in this round.
   */
  activities: SingleActivity[]
  /**
   * What round of the acitvity log this is.
   */
  round_counter: number
  /**
   * Amount of players remaining.
   */
  players_remaining: number
}

// A single activity that happens in a given round.
export type SingleActivity = {
  activity_order: number
  /**
   * Description of the activity that happens. Ex: "PLAYER_0 drank infected water and died."
   */
  description: Prisma.ActivitiesGroupByOutputType['description']
  /**
   * Whether it is PVE, PVP, or REVIVE
   */
  environment: Prisma.ActivitiesGroupByOutputType['environment']
  /**
   * Id of the activity
   */
  id: Prisma.ActivitiesGroupByOutputType['id']
  /**
   * Kill count for each activity
   */
  kill_count: { [playerId: string]: Prisma.Decimal }
  /**
   * Participants of the activity
   */
  participants: (PickFromPlayers | DiscordPlayer)[]
}

export interface CreateRoom {
  slug: string
  params: {
    pve_chance: number
    revive_chance: number
  }
  contract_address: string
  createdBy: string
}

export type IronSessionUserData = Pick<
  Prisma.UsersGroupByOutputType,
  'id' | 'name' | 'is_admin' | 'discord_id'
> & { signature: string }

export type UserDataFetchByDiscordId = Pick<
  Prisma.UsersGroupByOutputType,
  'id' | 'name' | 'discord_id'
>

/**
 * When starting the game via discord.
 */
export type StartRoomDiscordFetchBody = {
  /**
   * If true, we should save this to our database.
   * Note: Doing this as a temporary solution. (Please don't make this non-temporary)
   */
  save_to_db?: boolean
  /**
   * Id of user starting a game.
   */
  discord_id: string
  /**
   * Room slug
   */
  roomSlug: string
  /**
   * Discord secret message for auth reasons.
   */
  discord_secret: string
  /**
   * All players joined via emoji click
   */
  players: {
    /**
     * Discord id of player
     */
    id: string
    /**
     * Discord username of player
     */
    username: string
  }[]
}

export type CreateRoomRequestBody = Omit<CreateRoom, 'createdBy'> & {
  /**
   * Id of user starting a game.
   */
  discord_id?: string
  /**
   * Discord secret message for auth reasons.
   */
  discord_secret?: string
  /**
   * If true, we should save this to our database.
   * Note: Doing this as a temporary solution. (Please don't make this non-temporary)
   */
  save_to_db?: boolean
}
