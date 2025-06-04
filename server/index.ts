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
  name: string;
}

interface GameRoom {
  players: Player[];
  ball: { x: number; y: number; vx: number; vy: number };
  score: { left: number; right: number };
}

const rooms: Record<string, GameRoom> = {};

function createNewRoom(): GameRoom {
  return {
    players: [],
    ball: { x: 50, y: 50, vx: 0.5, vy: 0.5 },
    score: { left: 0, right: 0 },
  };
}

function resetBall(ball: { x: number; y: number; vx: number; vy: number }) {
  ball.x = 50;
  ball.y = 50;
  ball.vx = Math.random() > 0.5 ? 0.5 : -0.5;
  ball.vy = (Math.random() - 0.5) * 1;
}

function resetGame(room: GameRoom) {
  room.ball = { x: 50, y: 50, vx: 0.5, vy: 0.5 };
  room.score = { left: 0, right: 0 };
}

function gameLoop() {
  for (const roomId in rooms) {
    const room = rooms[roomId];
    const ball = room.ball;

    if (room.score.left >= 5 || room.score.right >= 5) {
      io.to(roomId).emit("game_state", {
        players: room.players,
        ball: room.ball,
        score: room.score,
        winner: room.score.left >= 5 ? room.players[0]?.name : room.players[1]?.name,
      });
      continue;
    }

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y <= 0 || ball.y >= 100) ball.vy *= -1;

    const [left, right] = room.players;

    if (left && ball.x <= 2) {
      if (ball.y >= left.y - 10 && ball.y <= left.y + 10) {
        ball.vx *= -1;
      } else {
        room.score.right += 1;
        resetBall(ball);
      }
    }

    if (right && ball.x >= 98) {
      if (ball.y >= right.y - 10 && ball.y <= right.y + 10) {
        ball.vx *= -1;
      } else {
        room.score.left += 1;
        resetBall(ball);
      }
    }

    io.to(roomId).emit("game_state", {
      players: room.players,
      ball: room.ball,
      score: room.score,
      winner: null,
    });
  }
}

setInterval(gameLoop, 1000 / 60);

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("join_room", ({ roomId, name }: { roomId: string; name: string }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = createNewRoom();
    }

    const room = rooms[roomId];
    if (room.players.length < 2) {
      room.players.push({ id: socket.id, y: 50, name });
      socket.join(roomId);
    }
  });

  socket.on("paddle_move", ({ roomId, y }) => {
    const room = rooms[roomId];
    if (!room) return;
    const player = room.players.find((p) => p.id === socket.id);
    if (player) player.y = y;
  });

  socket.on("restart_game", (roomId: string) => {
    const room = rooms[roomId];
    if (room) {
      resetGame(room);
    }
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      rooms[roomId].players = rooms[roomId].players.filter((p) => p.id !== socket.id);
    }
    console.log("Disconnected:", socket.id);
  });
});

httpServer.listen(4000, () => {
  console.log("Server running at http://localhost:4000");
});
