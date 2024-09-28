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
exports.deleteChat = exports.getGroupChatsForUser = exports.getGroupChatDetails = exports.updateGroupDetails = exports.removeUserFromGroup = exports.addUserToGroup = exports.createGroupChat = void 0;
const groupChat_1 = __importDefault(require("../models/groupChat"));
const user_1 = __importDefault(require("../models/user"));
const message_1 = __importDefault(require("../models/message"));
// Create a new group chat
const createGroupChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { participants, groupName, groupImage } = req.body;
    try {
        // Ensure all participants are valid users
        const validParticipants = yield user_1.default.find({ _id: { $in: participants } });
        if (validParticipants.length !== participants.length) {
            return res.status(400).json({
                success: false,
                message: "One or more participants are invalid",
            });
        }
        // Create a new group chat
        let groupChat = new groupChat_1.default({
            participants: [...participants, (_a = req.user) === null || _a === void 0 ? void 0 : _a._id], // Add current user as admin to participants
            admin: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
            groupName,
            groupImage,
        });
        // Save the group chat
        yield groupChat.save();
        groupChat = yield groupChat.populate("participants", "name email");
        res.status(201).json({
            success: true,
            data: groupChat,
        });
    }
    catch (error) {
        console.error("Error creating group chat:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.createGroupChat = createGroupChat;
// Add a user to the group chat
const addUserToGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { groupId, userId } = req.body;
    try {
        // Find the group chat and ensure the requester is the admin
        const groupChat = yield groupChat_1.default.findById(groupId);
        if (!groupChat) {
            return res.status(404).json({
                success: false,
                message: "Group chat not found",
            });
        }
        if (!groupChat.admin.equals((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString())) {
            return res.status(403).json({
                success: false,
                message: "Only the group admin can add participants",
            });
        }
        // Check if the user is already a participant
        if (groupChat.participants.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "User is already a participant",
            });
        }
        // Add the user to the group
        groupChat.participants.push(userId);
        yield groupChat.save();
        res.status(200).json({
            success: true,
            data: groupChat,
        });
    }
    catch (error) {
        console.error("Error adding user to group chat:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.addUserToGroup = addUserToGroup;
// Remove a user from the group chat
const removeUserFromGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { groupId, userId } = req.body;
    try {
        // Find the group chat and ensure the requester is the admin
        const groupChat = yield groupChat_1.default.findById(groupId);
        if (!groupChat) {
            return res.status(404).json({
                success: false,
                message: "Group chat not found",
            });
        }
        if (!groupChat.admin.equals((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString())) {
            return res.status(403).json({
                success: false,
                message: "Only the group admin can remove participants",
            });
        }
        // Check if the user is a participant
        if (!groupChat.participants.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "User is not a participant",
            });
        }
        // Remove the user from the group
        groupChat.participants = groupChat.participants.filter((id) => !id.equals(userId));
        yield groupChat.save();
        res.status(200).json({
            success: true,
            data: groupChat,
        });
    }
    catch (error) {
        console.error("Error removing user from group chat:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.removeUserFromGroup = removeUserFromGroup;
// Update group chat details (name, image, etc.)
const updateGroupDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { groupId, groupName, groupImage } = req.body;
    try {
        const groupChat = yield groupChat_1.default.findById(groupId);
        if (!groupChat) {
            return res.status(404).json({
                success: false,
                message: "Group chat not found",
            });
        }
        if (!groupChat.admin.equals((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString())) {
            return res.status(403).json({
                success: false,
                message: "Only the group admin can update group details",
            });
        }
        // Update group details
        groupChat.groupName = groupName || groupChat.groupName;
        groupChat.groupImage = groupImage || groupChat.groupImage;
        yield groupChat.save();
        res.status(200).json({
            success: true,
            data: groupChat,
        });
    }
    catch (error) {
        console.error("Error updating group chat:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.updateGroupDetails = updateGroupDetails;
// Get group chat details
const getGroupChatDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    try {
        const groupChat = yield groupChat_1.default.findById(groupId)
            .populate("participants", "name email")
            .populate("admin", "name email");
        if (!groupChat) {
            return res.status(404).json({
                success: false,
                message: "Group chat not found",
            });
        }
        res.status(200).json({
            success: true,
            data: groupChat,
        });
    }
    catch (error) {
        console.error("Error fetching group chat details:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.getGroupChatDetails = getGroupChatDetails;
// Get group chat details
const getGroupChatsForUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    try {
        const chats = yield groupChat_1.default.find({ participants: userId })
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
exports.getGroupChatsForUser = getGroupChatsForUser;
// Delete chat
const deleteChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupID } = req.params;
    try {
        const deletedChat = yield groupChat_1.default.findByIdAndDelete(groupID);
        if (!deletedChat) {
            return res.status(404).json({
                success: false,
                message: "Couldn't find chat",
            });
        }
        const deletedMessages = yield message_1.default.deleteMany({ chatId: groupID });
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
