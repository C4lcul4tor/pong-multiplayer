// client/src/App.tsx
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

type Player = {
  id: string;
  y: number;
};

function App() {
  const [roomId, setRoomId] = useState("game1");
  const [players, setPlayers] = useState<Player[]>([]);
  const [myY, setMyY] = useState(50);

  useEffect(() => {
    socket.emit("join_room", roomId);

    socket.on("players_update", (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
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
    </div>
  );
}

export default App;
