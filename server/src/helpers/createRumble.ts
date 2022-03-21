import RumbleApp, { ActivitiesObjType, PlayerType, PrizeSplitType } from "@rumble-raffle-dao/rumble";

// TODO: Fetch activities from database.
export const createGame = async (
  activities: ActivitiesObjType,
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