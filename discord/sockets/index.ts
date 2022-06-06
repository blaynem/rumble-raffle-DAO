import { ServerToClientEvents, ClientToServerEvents } from "@rumble-raffle-dao/types";
import { JOIN_ROOM } from "@rumble-raffle-dao/types/constants";
import { Socket, io } from "socket.io-client";
import { CORS_BASE_WEB_URL } from "../constants";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(CORS_BASE_WEB_URL);

export const initSockets = () => {
  console.log('--init room', CORS_BASE_WEB_URL);
  // socket.connect();
  
  // socket.on("connect", () => {
  //   console.log('-reeee?', socket); // false
  // });
  socket.emit(JOIN_ROOM, 'DEFAULT');
  
  socket.onAny((event, ...args) => {
    // console.log(`discord: got event: ${event}`, args);
  })
  
  socket.on('disconnect', () => {
    console.log('--disconnect');
  });
}