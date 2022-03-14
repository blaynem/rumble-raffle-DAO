import express from "express";
import bodyParser from 'body-parser';
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

import { initRoom } from './src/sockets/server';
import { PVE_ACTIVITIES, PVP_ACTIVITIES, REVIVE_ACTIVITIES } from './activities';
import RumbleApp, { ActivitiesObjType } from "@rumble-raffle-dao/rumble";
import client from './src/client';
import { RoomRumbleDataType } from "./types/server";
import { SupabaseRoomExtendPlayers } from "./types/supabase";

const app = express();
const jsonParser = bodyParser.json()
const port = process.env.PORT || 3001;

app.use(cors());
const server = http.createServer(app);

const roomRumbleData: RoomRumbleDataType = {};

app.get('/', (req: any, res: any) => {
  res.json({ 'message': 'ok' });
})

// TODO: Implement create
app.post('/create', jsonParser, (req: any, res: any) => {
  console.log('---create called', req.body);
  res.status(res.statusCode).send({ thing: 'do thing' })
})

/**
 * Gets the room data from the slug
 * 
 * Returns whether the room is active or not.
 */
app.get('/rooms/:slug', (req: any, res: any) => {
  const slug = req.params.slug;
  const activeRoom = Boolean(roomRumbleData[slug])
  res.json({ activeRoom });
})

/* Error handler middleware -- boilerplate, no idea what this do. */
app.use((err: any, req: any, res: any, next: any) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ 'message': err.message });

  return;
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

server.listen(port, () => {
  console.log("SERVER RUNNING");

  initServer();
});

io.sockets.on("connection", (socket) => {
  initRoom(io, socket, roomRumbleData);
})

/**
 * TODO
 * - check if room exists
 * - - If true, join room
 * - - If false, check if its in database
 * - instantiate Rumble object in room
 * 
 * Create Game URL
 * - /create - if that's called when data is returned we get the slug and add it to roomRumbleData.
 */


const defaultGameActivities: ActivitiesObjType = {
  PVE: PVE_ACTIVITIES,
  PVP: PVP_ACTIVITIES,
  REVIVE: REVIVE_ACTIVITIES
};

// todo: fetch all rooms from db and create the games inside roomRumbleData.
const initServer = async () => {
  const { data, error } = await client.from<SupabaseRoomExtendPlayers>('rooms').select(`
    id,
    slug,
    params,
    players:users(id, publicAddress, name)
  `)
  if (error) {
    console.log('---error', error);
    return;
  }
  data.forEach(room => {
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
  })
}