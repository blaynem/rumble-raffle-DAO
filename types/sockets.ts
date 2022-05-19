import { Prisma } from '.prisma/client'
import { GAME_START_COUNTDOWN, NEXT_ROUND_START_COUNTDOWN, UPDATE_ACTIVITY_LOG_ROUND, UPDATE_ACTIVITY_LOG_WINNER, UPDATE_PLAYER_LIST, JOIN_GAME_ERROR, JOIN_ROOM, JOIN_GAME, START_GAME } from "./constants";
import { EntireGameLog, IronSessionUserData, PlayerAndRoomInfoType } from "./server";

export interface ServerToClientEvents {
  [GAME_START_COUNTDOWN]: (timeToStart: number) => void;
  [NEXT_ROUND_START_COUNTDOWN]: (timeToStart: number) => void;
  [UPDATE_ACTIVITY_LOG_ROUND]: (activityLog: EntireGameLog['rounds']) => void;
  [UPDATE_ACTIVITY_LOG_WINNER]: (activityLog: EntireGameLog['winners']) => void;
  [UPDATE_PLAYER_LIST]: (data: PlayerAndRoomInfoType) => void;
  [JOIN_GAME_ERROR]: (err: any) => void;
}

export interface ClientToServerEvents {
  [JOIN_ROOM]: (roomSlug: string) => void;
  [JOIN_GAME]: (user: IronSessionUserData, roomSlug: string) => void;
  [START_GAME]: (user: IronSessionUserData, roomSlug: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
}