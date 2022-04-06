import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

import initServer from './src/helpers/initServer';
import { initRoom } from './src/sockets';
import {BASE_WEB_URL} from './constants';

/**
 * TODO:
 * - Error handling on server side so when something errors we don't need to restart the server, that's wack.
 * - Validate the "Create a room" inputs.
 * - Should somehow extract all of these types into another subfolder so they can be gotten across all files.
 */

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
const server = http.createServer(app);

app.use(require('./src/routes'));

/* Error handler middleware -- boilerplate, no idea what this do. */
app.use((err: any, req: any, res: any, next: any) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ 'message': err.message });

  return;
});

const io = new Server(server, {
  cors: {
    origin: BASE_WEB_URL,
    methods: ["GET", "POST"],
  },
});

server.listen(port, () => {
  console.log("SERVER RUNNING");

  // Initializes server and saves the roomRumbleData object
  initServer();
});

io.sockets.on("connection", (socket) => {
  initRoom(io, socket);
})
