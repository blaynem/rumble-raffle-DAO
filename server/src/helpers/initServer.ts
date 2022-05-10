import { addNewRoomToMemory } from "./roomRumbleData";
import client from "../client";
import { OmegaRoomInterface } from '@rumble-raffle-dao/types';
import { selectRoomInfo } from "./selectRoomInfo";
import prisma from "../client-temp";

const omegaFetch = `
id,
players:users!players(public_address, name),
params:params_id(*),
slug,
contract:contract_id(*),
game_started,
game_completed,
created_by,
game_activities: game_round_logs(*, activity:activity_id(*)),
winners
`

const InitializeServer = async () => {
  try {
    const tempData = await prisma.rooms.findMany({
      where: { Params: { game_completed: false } },
      select: {
        id: true,
        slug: true,
        Params: {
          include: {
            GameLogs: true,
            Contract: true,
          },
          select: {
            pve_chance: true,
            revive_chance: true,
            winners: true,
            game_started: true,
            game_completed: true,
            created_by: true,
            Players: {
              select: { User: { select: { id: true, name: true }} }
            },
          }
        }
      }
    })
    const { data, error } = await client.from<OmegaRoomInterface>('rooms')
      .select(omegaFetch)
      .eq('game_completed', false)
    if (error) {
      console.error('---error', error);
      return;
    }
    data.forEach(room => {
      const roomToAdd = selectRoomInfo(room)
      addNewRoomToMemory(roomToAdd);
    })
  } catch (error) {
    console.error('Server: InitializeServer', error);
  }
}



export default InitializeServer