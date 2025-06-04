import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

type Player = {
  id: string;
  y: number;
  name?: string;
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
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [ball, setBall] = useState<Ball>({ x: 50, y: 50 });
  const [score, setScore] = useState<Score>({ left: 0, right: 0 });
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    const handleGameState = (data: {
      players: Player[];
      ball: Ball;
      score: Score;
      winner: string | null;
    }) => {
      setPlayers(data.players);
      setBall(data.ball);
      setScore(data.score);
      setWinner(data.winner);
    };

    socket.on("game_state", handleGameState);
    return () => {
      socket.off("game_state", handleGameState);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!joined || winner) return;

      const currentPlayer = players.find((p) => p.id === socket.id);
      if (!currentPlayer) return;

      let newY = currentPlayer.y;
      if (e.key === "w" || e.key === "ArrowUp") newY -= 3;
      if (e.key === "s" || e.key === "ArrowDown") newY += 3;
      newY = Math.max(0, Math.min(100, newY));

      socket.emit("paddle_move", { roomId, y: newY });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [players, joined, winner]);

  const joinGame = () => {
    if (name.trim()) {
      socket.emit("join_room", { roomId, name });
      setJoined(true);
    }
  };

  const handleRestart = () => {
    socket.emit("restart_game", roomId);
    setWinner(null);
  };

  if (!joined) {
    return (
      <div style={styles.centered}>
        <h2 style={{ marginBottom: 10 }}>Enter your name to join:</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
        <button onClick={joinGame} style={styles.button}>
          Join Game
        </button>
      </div>
    );
  }

  return (
    <div style={styles.gameContainer}>
      {/* Scoreboard */}
      <div style={styles.score}>
        {score.left} : {score.right}
      </div>

      {/* Winner Message */}
      {winner && (
        <div style={styles.winnerBox}>
          🎉 {winner} Wins!
          <br />
          <button onClick={handleRestart} style={styles.button}>
            Restart Game
          </button>
        </div>
      )}

      {/* Paddles and Names */}
      {players.map((player, index) => (
        <React.Fragment key={player.id}>
          <div
            style={{
              ...styles.paddle,
              left: index === 0 ? "10px" : "calc(100% - 30px)",
              top: `${player.y}%`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: index === 0 ? "10px" : "calc(100% - 130px)",
              top: `${player.y - 12}%`,
              color: "#fff",
              fontSize: "14px",
              fontWeight: "bold",
              textAlign: "center",
              width: "120px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {player.name || "Player"}
          </div>
        </React.Fragment>
      ))}

      {/* Ball */}
      <div
        style={{
          ...styles.ball,
          left: `${ball.x}%`,
          top: `${ball.y}%`,
        }}
      />
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  gameContainer: {
    width: "100vw",
    height: "100vh",
    background: "#000",
    position: "relative",
    overflow: "hidden",
    fontFamily: "sans-serif",
  },
  score: {
    position: "absolute",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    color: "white",
    fontSize: 24,
  },
  winnerBox: {
    position: "absolute",
    top: "40%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#fff",
    color: "#000",
    padding: "20px 40px",
    borderRadius: 10,
    fontSize: 24,
    zIndex: 10,
    textAlign: "center",
  },
  paddle: {
    position: "absolute",
    width: "20px",
    height: "80px",
    background: "white",
    transform: "translateY(-50%)",
  },
  ball: {
    position: "absolute",
    width: "20px",
    height: "20px",
    background: "white",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontFamily: "sans-serif",
    backgroundColor: "#111",
    color: "#fff",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    marginBottom: "10px",
    width: "200px",
    borderRadius: "5px",
    border: "none",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "#fff",
    color: "#000",
    fontWeight: "bold",
    border: "none",
  },
};

export default App;
