import RumbleApp, { ActivitiesObjType, GameEndType, PlayerType, PrizeSplitType } from "@rumble-raffle-dao/rumble";

export const createGame = async (
  activities: ActivitiesObjType,
  prizeSplit: PrizeSplitType,
  initialPlayers: PlayerType[]
): Promise<GameEndType> => {
  const rumble = new RumbleApp({
    activities,
    prizeSplit,
    initialPlayers
  });
  return await rumble.startAutoPlayGame();
}