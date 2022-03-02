const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
// have to do .default because its not compiled
const RumbleApp = require('./Rumble').default;
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const Rumble = new RumbleApp();

io.on("connection", (socket: any) => {
  console.log(`User Connected: ${socket.id}`);

  // ===== EXAMPLES START ======
  // socket.on("join_room", (data) => {
  //   socket.join(data);
  //   console.log(`User with ID: ${socket.id} joined room: ${data}`);
  // });

  // socket.on("send_message", (data) => {
  //   socket.to(data.room).emit("receive_message", data);
  // });

  // socket.on("disconnect", () => {
  //   console.log("User Disconnected", socket.id);
  // });
  // ===== EXAMPLES END ======

  socket.on("join_room", (data: any) => {
    console.log('--data', Rumble)
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});