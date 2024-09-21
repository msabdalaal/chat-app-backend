"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chat_1 = require("../controllers/chat");
const authMiddleware_1 = require("../middleware/authMiddleware"); // Protect routes with authentication
const chatRoutes = express_1.default.Router();
// Create a new chat
chatRoutes.post("/create", authMiddleware_1.protect, chat_1.createChat);
// Get all chats for a specific user
chatRoutes.get("/userChats", authMiddleware_1.protect, chat_1.getChatsForUser);
exports.default = chatRoutes;
