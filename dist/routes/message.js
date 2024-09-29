"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const message_1 = require("../controllers/message");
const authMiddleware_1 = require("../middleware/authMiddleware");
const messageRoutes = express_1.default.Router();
// Get all messages for a specific chat
messageRoutes.get("/:chatId", authMiddleware_1.protect, message_1.getMessagesForChat);
// Add a message to an existing chat
messageRoutes.post("/:chatId", authMiddleware_1.protect, message_1.createMessage);
// Mark a specific message as read
messageRoutes.patch("/read/:chatId", authMiddleware_1.protect, message_1.markAllMessagesAsRead);
// Delete a specific message
messageRoutes.delete("/delete/:messageId", authMiddleware_1.protect, message_1.deleteMessage);
messageRoutes.delete("/deleteAll/:chatID", authMiddleware_1.protect, message_1.deleteAllMessagesForChat);
exports.default = messageRoutes;
