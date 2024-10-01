import { Server } from "socket.io";
import http from "http";
import express from "express";
import { IUser, IUserSocketMap } from "../types";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true,
  },
});

let userSocketMap: IUserSocketMap = {};
export const getReceiverSocketId = (receiverId: string) => {
  return userSocketMap?.[receiverId];
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId?.toString() ?? ""] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", ({ currentChat }) => {
    currentChat.participants.forEach((user: IUser) => {
      if (user._id !== userId) {
        io.to(userSocketMap[user._id?.toString() ?? ""]!).emit(
          "displayTyping",
          { userId, chatId: currentChat._id }
        );
      }
    });
  });
  socket.on("stopTyping", ({ currentChat }) => {
    currentChat.participants.forEach((user: IUser) => {
      if (user._id !== userId) {
        io.to(userSocketMap[user._id?.toString() ?? ""]!).emit("hideTyping", {
          userId,
          chatId: currentChat._id,
        });
      }
    });
  });
  socket.on("disconnect", () => {
    if (userId) delete userSocketMap[userId as string];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
