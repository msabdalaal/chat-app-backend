import { Server } from "socket.io";
import http from "http";
import express from "express";
import { IUserSocketMap } from "../types";

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

  socket.on("disconnect", () => {
    if (userId) delete userSocketMap[userId as string];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
