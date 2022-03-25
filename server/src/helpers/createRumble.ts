import RumbleApp, { GameEndType, SetupType } from "@rumble-raffle-dao/rumble";

export const createGame = async (setup: SetupType): Promise<GameEndType> => {
  const rumble = new RumbleApp(setup);
  return await rumble.startAutoPlayGame();
}