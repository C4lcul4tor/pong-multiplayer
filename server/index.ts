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

    // Stop game if there's a winner
    if (room.score.left >= 5 || room.score.right >= 5) {
      io.to(roomId).emit("game_state", {
        players: room.players,
        ball: room.ball,
        score: room.score,
        winner: room.score.left >= 5 ? "Left Player" : "Right Player",
      });
      continue;
    }

    // Ball movement
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Bounce off top/bottom walls
    if (ball.y <= 0 || ball.y >= 100) {
      ball.vy *= -1;
    }

    const [leftPlayer, rightPlayer] = room.players;

    // Left paddle collision
    if (leftPlayer && ball.x <= 2) {
      if (ball.y >= leftPlayer.y - 10 && ball.y <= leftPlayer.y + 10) {
        ball.vx *= -1;
      } else {
        room.score.right += 1;
        resetBall(ball);
      }
    }

    // Right paddle collision
    if (rightPlayer && ball.x >= 98) {
      if (ball.y >= rightPlayer.y - 10 && ball.y <= rightPlayer.y + 10) {
        ball.vx *= -1;
      } else {
        room.score.left += 1;
        resetBall(ball);
      }
    }

    // Broadcast state
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
  console.log("Player connected:", socket.id);

  socket.on("join_room", (roomId: string) => {
    if (!rooms[roomId]) {
      rooms[roomId] = createNewRoom();
    }

    const room = rooms[roomId];
    if (room.players.length < 2) {
      room.players.push({ id: socket.id, y: 50 });
      socket.join(roomId);
      io.to(roomId).emit("players_update", room.players);
    }
  });

  socket.on("paddle_move", ({ roomId, y }) => {
    const room = rooms[roomId];
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (player) {
      player.y = y;
    }
  });

  socket.on("restart_game", (roomId: string) => {
    const room = rooms[roomId];
    if (room) {
      resetGame(room);
      io.to(roomId).emit("game_state", {
        players: room.players,
        ball: room.ball,
        score: room.score,
        winner: null,
      });
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
