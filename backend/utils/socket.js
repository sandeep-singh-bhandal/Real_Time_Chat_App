import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/User.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://real-time-chat-app-pink-tau.vercel.app",
    ],
  },
});

export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

// Used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;
  if (userId) userSocketMap[userId] = socket.id;
  console.log("User connected! ", socket.id);

  socket.on("typingTrigger", ({ fromUserId, toUserId, isTyping }) => {
    const receiverSocketId = getReceiverSocketId(toUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typingListener", {
        fromUserId,
        toUserId,
        isTyping,
      });
    }
  });

  // broadcasting that a user joined
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", async () => {
    console.log("User disconnected! ", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    io.emit("userDisconnected", { userId, lastSeen: new Date() });
    await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
  });
});

export { io, app, server };
