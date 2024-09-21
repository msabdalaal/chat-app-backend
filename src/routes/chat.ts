import express from "express";
import { createChat, getChatsForUser } from "../controllers/chat";
import { protect } from "../middleware/authMiddleware"; // Protect routes with authentication

const chatRoutes = express.Router();

// Create a new chat
chatRoutes.post("/create", protect, createChat);

// Get all chats for a specific user
chatRoutes.get("/userChats", protect, getChatsForUser);


export default chatRoutes;
