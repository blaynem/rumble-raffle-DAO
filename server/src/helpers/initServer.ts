import { addNewRoomToMemory } from "./roomRumbleData";
import { RoomDataType } from '@rumble-raffle-dao/types';
import prisma from "../client";

const InitializeServer = async () => {
  try {
    const data = await prisma.rooms.findMany({
      where: { Params: { game_completed: false } },
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
              select: { User: { select: { id: true, name: true, discord_id: true } } }
            },
            Contract: true
          }
        }
      }
    })
    data.forEach(room => {
      const { Params: { Players, Contract, ...restParams }, ...restRoomData } = room
      const roomToAdd: RoomDataType = {
        room: restRoomData,
        params: restParams,
        players: Players.map(player => player.User),
        contract: Contract,
        gameData: null,
        gameLogs: []
      }
      addNewRoomToMemory(roomToAdd);
    })
  } catch (error) {
    console.error('Server: InitializeServer', error);
  }
}



export default InitializeServer