import RumbleApp, { ActivitiesObjType } from "@rumble-raffle-dao/rumble";
import { PVE_ACTIVITIES, PVP_ACTIVITIES, REVIVE_ACTIVITIES } from "../activities";
import { definitions } from "../types";
import client from "./client";
import roomRumbleData from "./roomRumbleData";

const defaultGameActivities: ActivitiesObjType = {
  PVE: PVE_ACTIVITIES,
  PVP: PVP_ACTIVITIES,
  REVIVE: REVIVE_ACTIVITIES
};

export type RoomUsersUnionType = {
  players?: definitions["users"][]
  params: any;
} & definitions["rooms"]

// todo: fetch all rooms from db and create the games inside roomRumbleData.
const InitializeServer = async () => {
  const { data, error } = await client.from<RoomUsersUnionType>('rooms').select(`
    id,
    slug,
    params,
    players:users!players(id, publicAddress, name)
  `)
  if (error) {
    console.log('---error', error);
    return;
  }
  data.forEach(room => {
    addNewRoomToMemory(room);
  })
}

export const addNewRoomToMemory = (room: RoomUsersUnionType) => {
  const slug = room.slug;
  const roomData = {
    rumble: new RumbleApp({
      activities: defaultGameActivities,
      prizeSplit: room.params.prizeSplit,
      initialPlayers: room.players
    }),
    id: room.id,
    slug
  }
  roomRumbleData[slug] = roomData;
}

export default InitializeServer