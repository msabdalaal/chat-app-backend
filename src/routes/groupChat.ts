import express from "express";
import {
  createGroupChat,
  addUserToGroup,
  removeUserFromGroup,
  updateGroupDetails,
  getGroupChatDetails,
  getGroupChatsForUser,
  deleteChat,
} from "../controllers/groupChat";
import { protect } from "../middleware/authMiddleware"; // Middleware to protect routes

const groupChatRoutes = express.Router();

// Create a new group chat
groupChatRoutes.post("/create", protect, createGroupChat);

// Add a user to the group chat
groupChatRoutes.post("/add/:groupID", protect, addUserToGroup);

// Remove a user from the group chat
groupChatRoutes.delete("/deleteUser/:groupID", protect, removeUserFromGroup);

//Delete group chat
groupChatRoutes.delete("/delete/:groupID", protect, deleteChat);

// Update group chat details (name, image, etc.)
groupChatRoutes.patch("/update", protect, updateGroupDetails);

// Get group chat details
groupChatRoutes.get("/:groupId", protect, getGroupChatDetails);

// Get groups dor user
groupChatRoutes.get("/userChats/all", protect, getGroupChatsForUser);

export default groupChatRoutes;
