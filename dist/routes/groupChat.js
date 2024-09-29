"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const groupChat_1 = require("../controllers/groupChat");
const authMiddleware_1 = require("../middleware/authMiddleware"); // Middleware to protect routes
const groupChatRoutes = express_1.default.Router();
// Create a new group chat
groupChatRoutes.post("/create", authMiddleware_1.protect, groupChat_1.createGroupChat);
// Add a user to the group chat
groupChatRoutes.post("/add/:groupID", authMiddleware_1.protect, groupChat_1.addUserToGroup);
// Remove a user from the group chat
groupChatRoutes.delete("/deleteUser/:groupID", authMiddleware_1.protect, groupChat_1.removeUserFromGroup);
//Delete group chat
groupChatRoutes.delete("/delete/:groupID", authMiddleware_1.protect, groupChat_1.deleteChat);
// Update group chat details (name, image, etc.)
groupChatRoutes.patch("/update", authMiddleware_1.protect, groupChat_1.updateGroupDetails);
// Get group chat details
groupChatRoutes.get("/:groupId", authMiddleware_1.protect, groupChat_1.getGroupChatDetails);
// Get groups dor user
groupChatRoutes.get("/userChats/all", authMiddleware_1.protect, groupChat_1.getGroupChatsForUser);
exports.default = groupChatRoutes;
