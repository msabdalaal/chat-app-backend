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

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // This allows req.user to be recognized with type IUser
    }
  }
}

const port = process.env.PORT || 3000;

const app = express();
app.use(cookieParser()); // Use cookie-parser middleware
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

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

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
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
