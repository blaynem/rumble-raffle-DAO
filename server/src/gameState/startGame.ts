import { GAME_START_COUNTDOWN, NEXT_ROUND_START_COUNTDOWN, UPDATE_ACTIVITY_LOG_ROUND, UPDATE_ACTIVITY_LOG_WINNER } from "@rumble-raffle-dao/types/constants";
import prisma from "../client";
import { getVisibleGameStateForClient } from "../helpers/getVisibleGameStateForClient";
import availableRoomsData from "./roomRumbleData";
import { startRumble } from "../helpers/startRumble";

import { io } from '../sockets';
import { AllAvailableRoomsType } from "@rumble-raffle-dao/types";

/**
 * On Start of game:
 * - Assure only the game master can start the game
 * - Send activity log data
 */
export const startGame = async (roomSlug: string) => {
  try {
    const { roomData, gameState, discordPlayers } = availableRoomsData.getRoom(roomSlug);

    // Only let the room owner start the game.
    // if (id !== roomData?.params?.created_by) {
    //   console.warn(`${id} tried to start a game they are not the owner of.`);
    //   throw (`${id} tried to start a game they are not the owner of.`)
    // }

    const gameData = await startRumble(roomSlug);
    if ('error' in gameData) {
      throw (gameData.error);
    }

    const updatedRoomData: AllAvailableRoomsType = {
      ...availableRoomsData.getRoom(roomSlug),
    }
    // Set the local game start state to true.
    updatedRoomData.roomData.gameData = gameData;
    // Set the local game start state to true.
    updatedRoomData.roomData.params.game_started = true;
    // update the available room data
    availableRoomsData.updateRoom(roomSlug, updatedRoomData)

    // Start emitting the game events to the players on a delay.
    dripGameDataOnDelay(roomSlug);
    io.in(roomSlug).emit(GAME_START_COUNTDOWN, gameState.waitTime, roomSlug);
  } catch (err) {
    console.error(err)
    return { error: err };
  }
}

/**
 * Drips out the game data on the selected delay.
 */
export const dripGameDataOnDelay = (roomSlug: string) => {
  try {
    const { roomData, gameState } = availableRoomsData.getRoom(roomSlug);
    const interval = setInterval(async () => {
      // If there is no game data, we don't want to do anything else.
      // This can happen if the admin clears the game state.
      if (!roomData.gameData) {
        clearInterval(interval);
        return;
      }
      // Before every loop we want to increase the round counter by one.
      gameState.roundCounter += 1;
      // NOTE: Be very careful to only use the gameDatas total rounds, not the visibleRounds.
      // Note: We don't need to subtract 1 from the length, because we're always increasing it above.
      // If we have reached the final round, then we can set these gameCompleted and showWinners to true.
      if (gameState.roundCounter >= roomData.gameData.rounds.length) {
        gameState.gameCompleted = true;
        gameState.showWinners = true;
        // Update the rooms completed state to true.
        const updateRoomSubmit = await prisma.rooms.update({
          where: { id: roomData.room.id },
          data: { Params: { update: { game_completed: true } } }
        })
        // Log any errors from changing game to completed
        // if (updateRoomSubmit.error) {
        //   console.error('drip game data: game_completed = true', updateRoomSubmit.error);
        // }
        // delete the game state from the server
        // delete availableRoomsData[roomSlug];
      }

      // We get the visible game state to spit out to the client.
      const { visibleRounds, winners } = getVisibleGameStateForClient(roomData, gameState);

      // If the game is completed and it's time to show the winners:
      // We do one last emit and then clear the interval.
      if (gameState.gameCompleted && gameState.showWinners) {
        io.in(roomSlug).emit(UPDATE_ACTIVITY_LOG_ROUND, visibleRounds, roomSlug)
        io.in(roomSlug).emit(UPDATE_ACTIVITY_LOG_WINNER, winners, roomSlug)
        clearInterval(interval);
        return;
      }

      // We only emit the rounds log, and update the games round timer until game ends.
      io.in(roomSlug).emit(UPDATE_ACTIVITY_LOG_ROUND, visibleRounds, roomSlug)
      io.in(roomSlug).emit(NEXT_ROUND_START_COUNTDOWN, gameState.waitTime, roomSlug);
    }, (gameState.waitTime * 1000))
  } catch (error) {
    console.error('Server: dripGameDataOnDelay', error);
  }
}