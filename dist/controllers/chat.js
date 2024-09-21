"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatsForUser = exports.createChat = void 0;
const chat_1 = __importDefault(require("../models/chat")); // Assuming the Chat model exists
const user_1 = __importDefault(require("../models/user")); // Assuming the User model exists
// Create a new chat between users
const createChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { participants } = req.body;
    try {
        // Ensure that participants exist and have valid users
        const validUsers = yield user_1.default.find({ _id: { $in: participants } });
        if (validUsers.length !== participants.length) {
            return res.status(400).json({
                success: false,
                message: "One or more participants are invalid",
            });
        }
        // Create a new chat
        const chat = new chat_1.default({
            participants: [...participants, (_a = req.user) === null || _a === void 0 ? void 0 : _a._id],
        });
        // Save the chat to the database
        yield chat.save();
        res.status(201).json({
            success: true,
            data: chat,
        });
    }
    catch (error) {
        console.error("Error creating chat:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.createChat = createChat;
// Get all chats for a specific user
const getChatsForUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    try {
        const chats = yield chat_1.default.find({ participants: userId })
            .populate("participants", "name email") // Populating participants with name and email
            .populate("lastMessage", "text createdAt sender readBy"); // Populating lastMessage with text, createdAt, and sender
        res.status(200).json({
            success: true,
            data: chats,
        });
    }
    catch (error) {
        console.error("Error fetching chats for user:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.getChatsForUser = getChatsForUser;
