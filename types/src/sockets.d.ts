import {
  NEW_GAME_CREATED,
  GAME_START_COUNTDOWN,
  NEXT_ROUND_START_COUNTDOWN,
  UPDATE_ACTIVITY_LOG_ROUND,
  UPDATE_ACTIVITY_LOG_WINNER,
  UPDATE_PLAYER_LIST,
  JOIN_GAME_ERROR,
  JOIN_ROOM,
  SYNC_PLAYERS_REQUEST,
  SYNC_PLAYERS_RESPONSE
} from '../constants'
import {
  DiscordPlayer,
  EntireGameLog,
  PickFromPlayers,
  PlayerAndRoomInfoType,
  RoomDataType
} from './server'

export interface ServerToClientEvents {
  [GAME_START_COUNTDOWN]: (timeToStart: number, slug: string) => void
  [NEXT_ROUND_START_COUNTDOWN]: (timeToStart: number, slug: string) => void
  [UPDATE_ACTIVITY_LOG_ROUND]: (activityLog: EntireGameLog['rounds'], slug: string) => void
  [UPDATE_ACTIVITY_LOG_WINNER]: (activityLog: EntireGameLog['winners'], slug: string) => void
  [UPDATE_PLAYER_LIST]: (data: PlayerAndRoomInfoType, slug: string) => void
  [JOIN_GAME_ERROR]: (err: any, slug: string) => void
  [SYNC_PLAYERS_RESPONSE]: (response: SyncPlayersResponseType, slug: string) => void
  [NEW_GAME_CREATED]: (roomData: RoomDataType) => void
}

export type SyncPlayersResponseType = {
  data: (PickFromPlayers | DiscordPlayer)[] | null
  paramsId: string | null
  error?: string
}

export interface ClientToServerEvents {
  [SYNC_PLAYERS_REQUEST]: (roomSlug: string) => void
  [JOIN_ROOM]: (roomSlug: string) => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {}
