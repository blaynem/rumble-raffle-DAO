import { Prisma } from '.prisma/client'
import { GAME_START_COUNTDOWN, NEXT_ROUND_START_COUNTDOWN, UPDATE_ACTIVITY_LOG_ROUND, UPDATE_ACTIVITY_LOG_WINNER, UPDATE_PLAYER_LIST, JOIN_GAME_ERROR, JOIN_ROOM, JOIN_GAME, START_GAME, SYNC_PLAYERS_REQUEST, SYNC_PLAYERS_RESPONSE } from "../constants";
import { EntireGameLog, IronSessionUserData, PickFromPlayers, PlayerAndRoomInfoType } from "./server";

export interface ServerToClientEvents {
  [GAME_START_COUNTDOWN]: (timeToStart: number) => void;
  [NEXT_ROUND_START_COUNTDOWN]: (timeToStart: number) => void;
  [UPDATE_ACTIVITY_LOG_ROUND]: (activityLog: EntireGameLog['rounds']) => void;
  [UPDATE_ACTIVITY_LOG_WINNER]: (activityLog: EntireGameLog['winners']) => void;
  [UPDATE_PLAYER_LIST]: (data: PlayerAndRoomInfoType) => void;
  [JOIN_GAME_ERROR]: (err: any) => void;
  [SYNC_PLAYERS_RESPONSE]: ({ data, paramsId, error }: SyncPlayersResponseType) => void;
}

export type SyncPlayersResponseType = {
  data: PickFromPlayers[], paramsId: string; error?: string
}

export interface ClientToServerEvents {
  [SYNC_PLAYERS_REQUEST]: (roomSlug: string) => void;
  [JOIN_ROOM]: (roomSlug: string) => void;
  [JOIN_GAME]: (user: Pick<Prisma.UsersGroupByOutputType, 'id' | 'name' | 'discord_id'>, roomSlug: string) => void;
  [START_GAME]: (user: IronSessionUserData, roomSlug: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
}