import RumbleApp, { GameEndType, PlayerType, PrizeValuesType, PrizeSplitType, ActivitiesObjType, RumbleRaffleInterface} from "@rumble-raffle-dao/rumble";
import {PVE_ACTIVITIES, PVP_ACTIVITIES, REVIVE_ACTIVITIES} from './activities';

const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const defaultGameActivities: ActivitiesObjType = {
  PVE: PVE_ACTIVITIES,
  PVP: PVP_ACTIVITIES,
  REVIVE: REVIVE_ACTIVITIES
};

const defaultPrizeSplit: PrizeSplitType = {
  kills: 20,
  thirdPlace: 5,
  secondPlace: 15,
  firstPlace: 50,
  altSplit: 9,
  creatorSplit: 1,
}

// TODO: Save rumble data state in individual roomIdsrooms.
const Rumble = new RumbleApp({ activities: defaultGameActivities, prizeSplit: defaultPrizeSplit })

io.on("connection", (socket: any) => {
  console.log(`User Connected: ${socket.id}`);

  /**
   * On joining room we want to:
   * - ??
   * - Return all players and the prize list
   */
  socket.on("join_room", (roomId: string) => {
    socket.join(roomId);
    console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
    const playersAndPrizeSplit = getPlayersAndPrizeSplit();
    io.to(socket.id).emit("update_player_list", playersAndPrizeSplit);
  });

  /**
   * On Join Game we want to:
   * - Add player to game
   * - ??
   * - Return all players and prize list
   */
  socket.on("join_game", (data: {playerData: any; roomId: string}) => {
    socket.join(data.playerData);
    addPlayer(data.playerData);
    const playersAndPrizeSplit = getPlayersAndPrizeSplit();
    console.log(`User with ID: ${socket.id} joined room: ${JSON.stringify(data)}`);
    io.in(data.roomId).emit("update_player_list", playersAndPrizeSplit);
  });

  /**
   * On Start of game:
   * - Assure only the game master can start the game
   * - Send activity log data
   * - ??
   * - ??
   * - TODO: Add timer so round info gets sent every 30s or so
   */
  socket.on("start_game", async (data: any) => {
    console.log('--start game', data);
    // TODO: Only let game master start the game
    const gameData = await startAutoPlayGame();
    io.in(data.roomId).emit("update_activity_log", gameData.activityLogs)
    // TODO: Only release one part of the activity log at a time over time.
    // TODO: Display all players who earned a prize on a screen somewhere.
  })

  socket.on("clear_game", async (data: any) => {
    console.log('--clear game', data);
    // TODO: Only let game master clear the game
    const gameData = await clearGame();
    io.in(data.roomId).emit("update_activity_log", gameData.activityLogs)
  })
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});

const addPlayer = (playerData: PlayerType) => {
  return Rumble.addPlayer(playerData);
}

const getPlayersAndPrizeSplit = (): {allPlayers: PlayerType[]; prizeSplit: PrizeValuesType} => {
  const allPlayers = Rumble.getAllPlayers();
  const prizeSplit = Rumble.getPrizes();
  console.log(JSON.stringify(allPlayers));
  return {
    allPlayers,
    prizeSplit
  }
}

const startAutoPlayGame = async (): Promise<GameEndType> => {
  return await Rumble.startAutoPlayGame();
}

const clearGame = (): Promise<GameEndType> => {
  return Rumble.restartGame();
}