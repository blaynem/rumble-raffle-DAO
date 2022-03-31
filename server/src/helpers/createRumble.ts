import RumbleApp from "@rumble-raffle-dao/rumble";
import { SetupType, GameEndType } from "@rumble-raffle-dao/rumble/types";

export const createGame = async (setup: SetupType): Promise<GameEndType> => {
  const rumble = new RumbleApp(setup);
  return await rumble.startAutoPlayGame();
}