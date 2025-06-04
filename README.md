# 🏓 Real-Time Multiplayer Pong Game

A full-stack real-time Pong game built using **React**, **Node.js**, **Socket.IO**, and **TypeScript**. This project demonstrates interactive multiplayer game development using WebSockets for real-time updates.


---

## 🎯 Features

✅ 2-player matchmaking using room IDs  
✅ Real-time paddle movement and ball physics  
✅ Scoring system with automatic win detection (first to 5)  
✅ Keyboard controls (W/S or Arrow keys)  
✅ Name input and player name display  
✅ Restart game button after winner is declared  

---

## 🧱 Tech Stack

| Layer     | Tools & Libraries |
|-----------|-------------------|
| Frontend  | React, TypeScript, socket.io-client |
| Backend   | Node.js, Express, Socket.IO, TypeScript |
| Real-Time | WebSocket via Socket.IO |
| Styling   | Inline CSS styles |

---

## 🧩 Project Structure

pong-multiplayer/
├── client/ ← React frontend
│ └── src/
│ └── App.tsx
├── server/ ← Node.js backend with game logic
│ └── index.ts
├── README.md
└── .gitignore


---

## 🧪 How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/C4lcul4tor/pong-multiplayer.git
cd pong-multiplayer
2. Start the Server

cd server
npm install
npx ts-node index.ts
Server will run on http://localhost:4000

3. Start the Frontend
cd ../client
npm install
npm start
Frontend will run on http://localhost:3000

Player Name Input

Game Arena with Ball and Paddles

Real-time Movement

Winner Announcement & Restart

🙌 Credits
Built by C4lcul4tor
For the Real-Time Game Assignment — Kutaisi International University

---

