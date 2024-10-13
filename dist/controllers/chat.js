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
exports.deleteChat = exports.getChatsForUser = exports.createChat = void 0;
const chat_1 = __importDefault(require("../models/chat")); // Assuming the Chat model exists
const user_1 = __importDefault(require("../models/user")); // Assuming the User model exists
const message_1 = __importDefault(require("../models/message"));
const socket_1 = require("../socket/socket");
// Create a new chat between users
const createChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
        const existingChat = yield chat_1.default.findOne({
            participants: { $all: [...participants, (_a = req.user) === null || _a === void 0 ? void 0 : _a._id] },
        });
        if (existingChat) {
            return res.status(400).json({
                success: false,
                message: "Chat already exists",
            });
        }
        // Create a new chat
        let chat = new chat_1.default({
            participants: [...participants, (_b = req.user) === null || _b === void 0 ? void 0 : _b._id],
        });
        // Save the chat to the database
        yield chat.save();
        chat = yield chat.populate("participants", "name email");
        // Sending Messages to users
        const receiverSocketIds = chat.participants.map((user) => {
            var _a;
            const Id = (_a = socket_1.getReceiverSocketId === null || socket_1.getReceiverSocketId === void 0 ? void 0 : (0, socket_1.getReceiverSocketId)(user._id.toString())) !== null && _a !== void 0 ? _a : "";
            return Id;
        });
        if (receiverSocketIds) {
            receiverSocketIds
                .filter((ID) => { var _a, _b; return ID != (0, socket_1.getReceiverSocketId)(((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) || ""); })
                .forEach((ID) => {
                socket_1.io.to(ID).emit("newChat", chat);
            });
        }
        res.status(201).json({
            success: true,
            data: chat, // Populating participants with name and email
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
// Delete chat
const deleteChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatID } = req.params;
    try {
        const deletedChat = yield chat_1.default.findByIdAndDelete(chatID);
        if (!deletedChat) {
            return res.status(404).json({
                success: false,
                message: "Couldn't find chat",
            });
        }
        const deletedMessages = yield message_1.default.deleteMany({ chatId: chatID });
        res.status(200).json({
            success: true,
            data: deletedChat,
        });
    }
    catch (error) {
        console.error("Error Deleting Chat:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.deleteChat = deleteChat;
