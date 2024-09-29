import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser"; // Import cookie-parser
import "./db/mongoose"; // Assuming this connects to MongoDB
dotenv.config();
import { IUser } from "./types"; // Adjust the path to your user model if needed
import userRoutes from "./routes/user";
import chatRoutes from "./routes/chat";
import messageRoutes from "./routes/message";
import groupChatRoutes from "./routes/groupChat";
import notificationRoutes from "./routes/notification";
import { app, server } from "./socket/socket";

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // This allows req.user to be recognized with type IUser
    }
  }
}

const port = process.env.PORT || 3000;

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


server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
