import express from "express";
import { getMessagesForChat, deleteMessage, createMessage, markAllMessagesAsRead } from "../controllers/message";
import { protect } from "../middleware/authMiddleware";

const messageRoutes = express.Router();

// Get all messages for a specific chat
messageRoutes.get("/:chatId", protect, getMessagesForChat);

// Add a message to an existing chat
messageRoutes.post("/:chatId", protect, createMessage);

// Mark a specific message as read
messageRoutes.patch("/read/:chatId", protect, markAllMessagesAsRead);

// Delete a specific message
messageRoutes.delete("/delete/:messageId", protect, deleteMessage);

export default messageRoutes;
