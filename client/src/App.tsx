import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

type Player = {
  id: string;
  y: number;
};

type Ball = {
  x: number;
  y: number;
};

type Score = {
  left: number;
  right: number;
};

function App() {
  const [roomId] = useState("game1");
  const [players, setPlayers] = useState<Player[]>([]);
  const [myY, setMyY] = useState(50);
  const [ball, setBall] = useState<Ball>({ x: 50, y: 50 });
  const [score, setScore] = useState<Score>({ left: 0, right: 0 });

  useEffect(() => {
    socket.emit("join_room", roomId);

    socket.on("game_state", (data: { players: Player[]; ball: Ball; score: Score }) => {
      setPlayers(data.players);
      setBall(data.ball);
      setScore(data.score);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const y = (e.clientY / window.innerHeight) * 100;
    setMyY(y);
    socket.emit("paddle_move", { roomId, y });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 10, left: "45%", color: "white" }}>
        {score.left} : {score.right}
      </div>

      {/* Paddles */}
      {players.map((player, index) => (
        <div
          key={player.id}
          style={{
            position: "absolute",
            left: index === 0 ? "10px" : "calc(100% - 30px)",
            top: `${player.y}%`,
            width: "20px",
            height: "80px",
            background: "white",
            transform: "translateY(-50%)",
          }}
        />
      ))}

      {/* Ball */}
      <div
        style={{
          position: "absolute",
          left: `${ball.x}%`,
          top: `${ball.y}%`,
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "white",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}

export default App;
