import React, { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io("http://localhost:4000");

function App() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ textAlign: "center", paddingTop: 50 }}>
      <h1>Real-Time Pong Game</h1>
      <p>Socket ID: {socket.id}</p>
    </div>
  );
}

export default App;
