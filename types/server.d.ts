import { definitions } from "./supabase";

export type PayoutsOmitId = Omit<definitions["payouts"], 'id'>;

export type PayoutTemplateType = {
  // Room data
  room: RoomDataType;
  // Players public address
  public_address: string;
  // Payment amount 
  payment_amount: number;
  // Reason for the payment
  payment_reason: definitions['payouts']['payment_reason'];
  // Notes to help determine reason later
  notes: definitions['payouts']['notes']
}

/**
 * We only want to send these fields back to players.
 */
export type PickFromPlayers = Pick<definitions["users"], "public_address" | "name">

export type RoomDataType = {
  // Who the room was created by
  created_by: definitions['rooms']['created_by']
  // Contract data for the given room
  contract: definitions['contracts']
  // Will be null until the game has been played and completed.
  gameData?: EntireGameLog | null;
  // True if the game has already been started.
  game_started: definitions['rooms']['game_started']
  // Id of the given room.
  id: string;
  // Players of the given room.
  players: PickFromPlayers[];
  // Params of the given room.
  params: definitions['room_params'];
  // Slug for the given room.
  slug: string;
}

export type AllAvailableRoomsType = {
  [slug: string]: RoomDataType;
}

export type PickFromUsers = Pick<definitions['users'], 'public_address' | 'name'>;

export type RoundsType = {
  activity: definitions['activities']
} & definitions['game_round_logs']

export type OmegaRoomInterface = {
  players: PickFromUsers[];
  params: definitions['room_params'];
  contract: definitions['contracts'];
  game_activities: RoundsType[];
} & Pick<definitions['rooms'], 'id' | 'slug' | 'game_started' | 'created_by' | 'winners'>


export type GameRoundLogsOmitId = Omit<definitions['game_round_logs'], 'id'>

// The entire games log.
export type EntireGameLog = {
  rounds: RoundActivityLog[];
  winners: PickFromPlayers[];
}

// The collection of activities that happens in a given game.
export type RoundActivityLog = {
  // Activities that have happened in this round.
  activities: SingleActivity[];
  // What round of the acitvity log this is.
  round_counter: number;
  // Amount of players remaining.
  players_remaining: number;
}

// A single activity that happens in a given round.
export type SingleActivity = {
  activity_order: number;
  // Description of the activity that happens. Ex: "PLAYER_0 drank infected water and died."
  description: definitions['activities']['description'];
  // Whether it is PVE, PVP, or REVIVE 
  environment: definitions['activities']['environment']
  // Id of the activity
  id: definitions['activities']['id'];
  // Participants of the activity
  participants: PickFromPlayers[];
}
