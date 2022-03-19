import RumbleApp, { ActivitiesObjType, PlayerType, PrizeSplitType } from "@rumble-raffle-dao/rumble";
import { PVE_ACTIVITIES, PVP_ACTIVITIES, REVIVE_ACTIVITIES } from "../activities";

const defaultGameActivities: ActivitiesObjType = {
  PVE: PVE_ACTIVITIES,
  PVP: PVP_ACTIVITIES,
  REVIVE: REVIVE_ACTIVITIES
};

// TODO: Fetch activities from database.
export const createGame = async (
  activities: ActivitiesObjType = defaultGameActivities,
  prizeSplit: PrizeSplitType,
  initialPlayers: PlayerType[]
) => {
  const rumble = new RumbleApp({
    activities,
    prizeSplit,
    initialPlayers
  });
  return await rumble.startAutoPlayGame();
}