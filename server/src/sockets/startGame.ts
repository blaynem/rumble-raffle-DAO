import { Prisma } from ".prisma/client";
import { GAME_COMPLETED, GAME_START_COUNTDOWN, NEXT_ROUND_START_COUNTDOWN, UPDATE_ACTIVITY_LOG_ROUND, UPDATE_ACTIVITY_LOG_WINNER } from "@rumble-raffle-dao/types/constants";
import { Server } from "socket.io";
import prisma from "../client-temp";
import { getVisibleGameStateForClient } from "../helpers/getVisibleGameStateForClient";
import availableRoomsData from "../helpers/roomRumbleData";
import { startRumble } from "../helpers/startRumble";


/**
 * Drips out the game data on the selected delay.
 */
const dripGameDataOnDelay = (io: Server, roomSlug: string) => {
  try {
    const { roomData, gameState } = availableRoomsData[roomSlug];
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
          where: { id: roomData.id },
          data: { Params: { update: { game_completed: true } } }
        })
        // Log any errors from changing game to completed
        // if (updateRoomSubmit.error) {
        //   console.error('drip game data: game_completed = true', updateRoomSubmit.error);
        // }
        // delete the game state from the server
        delete availableRoomsData[roomSlug];
      }

      // We get the visible game state to spit out to the client.
      const { visibleRounds, winners } = getVisibleGameStateForClient(roomData, gameState);

      // If the game is completed and it's time to show the winners:
      // We do one last emit and then clear the interval.
      if (gameState.gameCompleted && gameState.showWinners) {
        io.in(roomSlug).emit(UPDATE_ACTIVITY_LOG_ROUND, visibleRounds)
        io.in(roomSlug).emit(UPDATE_ACTIVITY_LOG_WINNER, winners)
        io.in(roomSlug).emit(GAME_COMPLETED, true);
        clearInterval(interval);
        return;
      }

      // We only emit the rounds log, and update the games round timer until game ends.
      io.in(roomSlug).emit(UPDATE_ACTIVITY_LOG_ROUND, visibleRounds)
      io.in(roomSlug).emit(NEXT_ROUND_START_COUNTDOWN, gameState.waitTime);
    }, (gameState.waitTime * 1000))
  } catch (error) {
    console.error('Server: dripGameDataOnDelay', error);
  }
}

/**
 * On Start of game:
 * - Assure only the game master can start the game
 * - Send activity log data
 * TODO:
 * - Display all players who earned a prize on a screen somewhere.
 */
async function startGame(io: Server, data: { playerData: Prisma.UsersCreateInput; roomSlug: string }) {
  try {
    const { roomData, gameState } = availableRoomsData[data.roomSlug];
    // Check if they're an admin.
    const userData = await prisma.users.findUnique({
      where: { id: data.playerData?.id },
      select: { is_admin: true }
    })
    // If they aren't an admin, we do nothing.
    if (!userData.is_admin) {
      return;
    }
    // Only let the room owner start the game.
    if (data.playerData?.id !== roomData.created_by) {
      console.warn(`${data.playerData?.id} tried to start a game they are not the owner of.`);
      return;
    }
    // Game already started, do nothing about it.
    if (!roomData || roomData.game_started || roomData.game_completed || roomData.players.length < 1) {
      console.log('---startGame--ERROR', data.roomSlug);
      return;
    }
    const gameData = await startRumble(data.roomSlug);
    roomData.gameData = gameData;
    // Start emitting the game events to the players on a delay.
    dripGameDataOnDelay(io, data.roomSlug);
    io.in(data.roomSlug).emit(GAME_START_COUNTDOWN, gameState.waitTime);
  } catch (error) {
    console.error('Server: startGame', error);
  }
}

export default startGame;