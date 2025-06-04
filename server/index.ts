import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

interface Player {
  id: string;
  y: number;
}

interface GameRoom {
  players: Player[];
}

const rooms: Record<string, GameRoom> = {};

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("join_room", (roomId: string) => {
    if (!rooms[roomId]) {
      rooms[roomId] = { players: [] };
    }

    if (rooms[roomId].players.length < 2) {
      rooms[roomId].players.push({ id: socket.id, y: 50 });
      socket.join(roomId);
      console.log(`Player ${socket.id} joined room ${roomId}`);
      io.to(roomId).emit("players_update", rooms[roomId].players);
    }
  });

  socket.on("paddle_move", ({ roomId, y }) => {
    const room = rooms[roomId];
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (player) {
      player.y = y;
      io.to(roomId).emit("players_update", room.players);
    }
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      room.players = room.players.filter((p) => p.id !== socket.id);
      io.to(roomId).emit("players_update", room.players);
    }
    console.log("Player disconnected:", socket.id);
  });
});

httpServer.listen(4000, () => {
  console.log("Server listening on http://localhost:4000");
});
