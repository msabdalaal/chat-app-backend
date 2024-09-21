import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser"; // Import cookie-parser
import "./db/mongoose"; // Assuming this connects to MongoDB

dotenv.config();
// types/express/index.d.ts
import { IUser } from "./types"; // Adjust the path to your user model if needed
import userRoutes from "./routes/user";
import chatRoutes from "./routes/chat";
import messageRoutes from "./routes/message";
import groupChatRoutes from "./routes/groupChat";
import notificationRoutes from "./routes/notification";
import { setUserOffline, setUserOnline } from "./controllers/presence";
import mongoose, { mongo } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // This allows req.user to be recognized with type IUser
    }
  }
}

const port = process.env.PORT || 3000;

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true,
  })
);

app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/groupChats", groupChatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notification", notificationRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", async (socket) => {
  const userId = new mongoose.Types.ObjectId(socket.id)
  console.log(`User connected: ${socket.id}`);

  // update user presence
  await setUserOnline(userId);
  io.emit("userPresenceUpdate", { userId:socket.id, isOnline: true });

  // Join a chat room
  socket.on("joinChat", (chatId: string) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  // Listen for messages
  socket.on("sendMessage", (messageData) => {
    const { chatId, senderId, text } = messageData;
    console.log(`Received message from ${senderId} in chat ${chatId}: ${text}`);

    // Emit message to the chat room
    io.to(chatId).emit("message", messageData);
  });

  // Typing event: Notify others in the room that the user is typing
  socket.on("typing", ({ chatId, userId }) => {
    socket.to(chatId).emit("userTyping", { userId, isTyping: true });
    console.log(`User ${userId} is typing in chat ${chatId}`);
  });

  // Stop typing event: Notify others in the room that the user stopped typing
  socket.on("stopTyping", ({ chatId, userId }) => {
    socket.to(chatId).emit("userTyping", { userId, isTyping: false });
    console.log(`User ${userId} stopped typing in chat ${chatId}`);
  });

  // Handle user disconnect
  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${socket.id}`);

    // update user presence
    await setUserOffline(userId);
    console.log(`User ${userId} is offline`);
    io.emit("userPresenceUpdate", { userId:socket.id, isOnline: false });
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
