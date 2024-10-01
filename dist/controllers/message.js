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
exports.deleteMessage = exports.markAllMessagesAsRead = exports.createMessage = exports.getMessagesForChat = void 0;
exports.deleteAllMessagesForChat = deleteAllMessagesForChat;
const message_1 = __importDefault(require("../models/message"));
const chat_1 = __importDefault(require("../models/chat"));
const mongoose_1 = __importDefault(require("mongoose")); // Import mongoose for ObjectId type
const notification_1 = require("./notification");
const groupChat_1 = __importDefault(require("../models/groupChat"));
const socket_1 = require("../socket/socket");
// Get all messages for a specific chat
const getMessagesForChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId } = req.params;
    try {
        const messages = yield message_1.default.find({ chatId }).populate("sender", "name email");
        res.status(200).json({
            success: true,
            data: messages,
        });
    }
    catch (error) {
        console.error("Error fetching messages for chat:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.getMessagesForChat = getMessagesForChat;
const createMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { chatId } = req.params;
    const { text } = req.body;
    try {
        const chat = yield chat_1.default.findById(chatId);
        const groupChat = yield groupChat_1.default.findById(chatId);
        const currentChat = chat ? chat : groupChat;
        // Check if chat exists
        if (!currentChat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }
        // Create a new message
        let message = new message_1.default({
            chatId,
            sender: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            text,
            readBy: [`${(_b = req.user) === null || _b === void 0 ? void 0 : _b._id}`],
        });
        // Save the message to the database
        yield message.save();
        message = yield message.populate("sender", "_id name email");
        // Notify all participants except the sender
        const chatObjectId = new mongoose_1.default.Types.ObjectId(chatId);
        const userObjectId = new mongoose_1.default.Types.ObjectId((_d = (_c = req.user) === null || _c === void 0 ? void 0 : _c._id) === null || _d === void 0 ? void 0 : _d.toString());
        currentChat.participants.forEach((participant) => {
            if (!participant.equals(userObjectId)) {
                (0, notification_1.createNotification)(participant, message.id, chatObjectId);
            }
        });
        // Update the last message in the chat
        currentChat.lastMessage = message.id;
        yield currentChat.save();
        // Sending Messages to users
        const receiverSocketIds = currentChat.participants.map((user) => {
            var _a;
            const Id = (_a = socket_1.getReceiverSocketId === null || socket_1.getReceiverSocketId === void 0 ? void 0 : (0, socket_1.getReceiverSocketId)(user.toString())) !== null && _a !== void 0 ? _a : "";
            return Id;
        });
        if (receiverSocketIds) {
            receiverSocketIds
                .filter((ID) => { var _a, _b; return ID != (0, socket_1.getReceiverSocketId)(((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) || ""); })
                .forEach((ID) => {
                socket_1.io.to(ID).emit("newMessage", message);
            });
        }
        res.status(201).json({
            success: true,
            data: message,
        });
    }
    catch (error) {
        console.error("Error creating message:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.createMessage = createMessage;
// Mark all unread messages as read by the current user when entering a chat
const markAllMessagesAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { chatId } = req.params;
    try {
        // Find all unread messages in the chat that the current user hasn't read
        const unreadMessages = yield message_1.default.find({
            chatId,
            readBy: { $ne: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id }, // Find messages where the user hasn't read
        });
        if (unreadMessages.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No unread messages",
                data: [],
            });
        }
        // Mark each unread message as read by adding the user's ID to the readBy array
        const userId = new mongoose_1.default.Types.ObjectId((_c = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id) === null || _c === void 0 ? void 0 : _c.toString());
        const updatedMessages = yield message_1.default.updateMany({ chatId, readBy: { $ne: userId } }, // Only update unread messages for this user
        { $push: { readBy: userId } }, // Add userId to readBy array
        { new: true });
        const chat = yield chat_1.default.findById(chatId);
        const groupChat = yield groupChat_1.default.findById(chatId);
        const currentChat = chat ? chat : groupChat;
        // Check if chat exists
        if (!currentChat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }
        const receiverSocketIds = currentChat.participants.map((user) => {
            var _a;
            const Id = (_a = socket_1.getReceiverSocketId === null || socket_1.getReceiverSocketId === void 0 ? void 0 : (0, socket_1.getReceiverSocketId)(user.toString())) !== null && _a !== void 0 ? _a : "";
            return Id;
        });
        if (receiverSocketIds) {
            receiverSocketIds
                .filter((ID) => { var _a, _b; return ID != (0, socket_1.getReceiverSocketId)(((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) || ""); })
                .forEach((ID) => {
                socket_1.io.to(ID).emit("readMessages", { chatId: currentChat._id, userId });
            });
        }
        res.status(200).json({
            success: true,
            message: `${updatedMessages.modifiedCount} messages marked as read`,
        });
    }
    catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.markAllMessagesAsRead = markAllMessagesAsRead;
// Delete a message
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { messageId } = req.params;
    try {
        // Find and delete the message
        const message = yield message_1.default.findByIdAndDelete(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found",
            });
        }
        // Find the chat that contains this message
        const chat = yield chat_1.default.findById(message.chatId);
        const groupChat = yield groupChat_1.default.findById(message.chatId);
        const currentChat = chat ? chat : groupChat;
        // Check if chat exists
        if (!currentChat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }
        // Check if the deleted message was the last message in the chat
        if (currentChat.lastMessage &&
            currentChat.lastMessage.toString() === message.id.toString()) {
            // Find the most recent message before the deleted one
            const previousMessage = yield message_1.default.findOne({
                chatId: currentChat._id,
                _id: { $lt: message._id }, // Find the message with an ID less than the deleted one
            }).sort({ _id: -1 }); // Sort by ID in descending order to get the most recent one
            // Update the lastMessage field in the chat document
            currentChat.lastMessage = previousMessage ? previousMessage.id : null;
            yield currentChat.save();
        }
        res.status(200).json({
            success: true,
            data: message,
            message: "Message deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.deleteMessage = deleteMessage;
function deleteAllMessagesForChat(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { chatID } = req.params;
        try {
            const messages = yield message_1.default.deleteMany({ chatId: chatID });
            if (messages.deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No messages found for this chat",
                });
            }
            res.status(200).json({
                success: true,
                message: `${messages.deletedCount} messages deleted successfully`,
            });
        }
        catch (error) {
            console.error("Error deleting messages for chat:", error);
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    });
}
