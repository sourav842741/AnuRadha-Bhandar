import express from "express";
import http from "http";
import { Server } from "socket.io";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// -------------------------------
// SOCKET MAIN CONNECTION
// -------------------------------
io.on("connection", (socket) => {
  console.log("⚡ New Socket Connected:", socket.id);

  // -------------------------------
  // 1️⃣ IDENTITY HANDLER
  // -------------------------------
  socket.on("identity", async ({ userId }) => {
    console.log("🆔 Identity →", userId);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/socket/connect`, {
        userId,
        socketId: socket.id,
      });

      console.log("✅ Identity Saved to DB");
    } catch (err) {
      console.log("❌ Identity Error:", err.message);
    }
  });

  // -------------------------------
  // 2️⃣ LIVE LOCATION UPDATE
  // -------------------------------
  socket.on("updateLocation", async ({ latitude, longitude, userId }) => {
    console.log("📍 Location Update From:", userId, latitude, longitude);

    const location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/update-location`, {
        userId,
        location,
      });

      // 🔥 Broadcast to all clients
      io.emit("update-delivery-location", {
        userId,
        location,
      });

      console.log("📤 Broadcasted: update-delivery-location");
    } catch (err) {
      console.log("❌ Location Error:", err.message);
    }
  });
    socket.on("join-room", (roomId) => {
    console.log("🚪 Joined Room:", roomId);
    socket.join(roomId);
  });

  // -------------------------------
  // 2️⃣ RECEIVE CHAT MESSAGE
  // -------------------------------
  socket.on("chat-message", async (msg) => {
    console.log("💬 Message Received:", msg);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/save`, msg);

      // Broadcast inside room
      io.to(msg.roomId).emit("chat-message", msg);

    } catch (err) {
      console.log("❌ Chat Save Error:", err.message);
    }
  });

  // -------------------------------
  // 3️⃣ DISCONNECT
  // -------------------------------
  socket.on("disconnect", async () => {
    console.log("❌ Socket Disconnected:", socket.id);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/socket/disconnect`, {
        socketId: socket.id,
      });

      console.log("🚫 User marked offline");
    } catch (err) {
      console.log("Disconnect Error:", err.message);
    }
  });
});

// ----------------------------------------------------
// 4️⃣ NOTIFY API → Admin Backend → Emit custom events
// ----------------------------------------------------
app.post("/notify", (req, res) => {
  const { socketId, event, data } = req.body;

  if (socketId) {
    // Send event to specific user
    console.log(`🎯 Sending "${event}" to socket ${socketId}`);
    io.to(socketId).emit(event, data);
  } else {
    // Broadcast to all
    console.log(`📢 Broadcasting "${event}"`);
    io.emit(event, data);
  }

  return res.json({ success: true });
});

// ----------------------------------------------------
const PORT = process.env.PORT || 4000;

server.listen(PORT, () =>
  console.log(`🔥 Socket Server Running on http://localhost:${PORT}`)
);
