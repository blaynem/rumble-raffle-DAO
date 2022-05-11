import { RoomDataType } from "@rumble-raffle-dao/types";
import prisma from "../client";
import { selectRoomInfo } from "./selectRoomInfo";

export const getGameDataFromDb = async (slug: string): Promise<{ data: RoomDataType | null; error: any; }> => {
  try {
    const data = await prisma.rooms.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        params_id: true,
        Params: {
          select: {
            id: true,
            pve_chance: true,
            revive_chance: true,
            winners: true,
            game_started: true,
            game_completed: true,
            created_by: true,
            Players: {
              select: { User: { select: { id: true, name: true } } }
            },
            GameLogs: {
              include: {
                Activity: true
              }
            },
          }
        }
      }
    })

    const { Params: { Players, GameLogs, ...restParams }, ...restRoomData } = data
    const roomInfo: RoomDataType = {
      room: restRoomData,
      params: restParams,
      players: Players.map(player => player.User),
      gameLogs: GameLogs
    }
    const roomToAdd = selectRoomInfo(roomInfo)
    console.log(roomToAdd);
    return { data: roomToAdd, error: null }
  } catch (error) {
    console.error('Server: Fetch by slug', error);
    return { data: null, error: error }
  }
}