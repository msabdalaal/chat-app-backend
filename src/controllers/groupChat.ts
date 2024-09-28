import { Request, Response } from "express";
import GroupChat from "../models/groupChat";
import User from "../models/user";

// Create a new group chat
export const createGroupChat = async (req: Request, res: Response) => {
  const { participants, groupName, groupImage } = req.body;

  try {
    // Ensure all participants are valid users
    const validParticipants = await User.find({ _id: { $in: participants } });
    if (validParticipants.length !== participants.length) {
      return res.status(400).json({
        success: false,
        message: "One or more participants are invalid",
      });
    }

    // Create a new group chat
    let groupChat = new GroupChat({
      participants: [...participants, req.user?._id], // Add current user as admin to participants
      admin: req.user?._id,
      groupName,
      groupImage,
    });

    // Save the group chat
    await groupChat.save();
    groupChat = await groupChat.populate("participants", "name email");

    res.status(201).json({
      success: true,
      data: groupChat,
    });
  } catch (error) {
    console.error("Error creating group chat:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Add a user to the group chat
export const addUserToGroup = async (req: Request, res: Response) => {
  const { groupId, userId } = req.body;

  try {
    // Find the group chat and ensure the requester is the admin
    const groupChat = await GroupChat.findById(groupId);

    if (!groupChat) {
      return res.status(404).json({
        success: false,
        message: "Group chat not found",
      });
    }

    if (!groupChat.admin.equals(req.user?._id?.toString())) {
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
    await groupChat.save();

    res.status(200).json({
      success: true,
      data: groupChat,
    });
  } catch (error) {
    console.error("Error adding user to group chat:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Remove a user from the group chat
export const removeUserFromGroup = async (req: Request, res: Response) => {
  const { groupId, userId } = req.body;

  try {
    // Find the group chat and ensure the requester is the admin
    const groupChat = await GroupChat.findById(groupId);

    if (!groupChat) {
      return res.status(404).json({
        success: false,
        message: "Group chat not found",
      });
    }

    if (!groupChat.admin.equals(req.user?._id?.toString())) {
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
    groupChat.participants = groupChat.participants.filter(
      (id) => !id.equals(userId)
    );
    await groupChat.save();

    res.status(200).json({
      success: true,
      data: groupChat,
    });
  } catch (error) {
    console.error("Error removing user from group chat:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update group chat details (name, image, etc.)
export const updateGroupDetails = async (req: Request, res: Response) => {
  const { groupId, groupName, groupImage } = req.body;

  try {
    const groupChat = await GroupChat.findById(groupId);

    if (!groupChat) {
      return res.status(404).json({
        success: false,
        message: "Group chat not found",
      });
    }

    if (!groupChat.admin.equals(req.user?._id?.toString())) {
      return res.status(403).json({
        success: false,
        message: "Only the group admin can update group details",
      });
    }

    // Update group details
    groupChat.groupName = groupName || groupChat.groupName;
    groupChat.groupImage = groupImage || groupChat.groupImage;

    await groupChat.save();

    res.status(200).json({
      success: true,
      data: groupChat,
    });
  } catch (error) {
    console.error("Error updating group chat:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get group chat details
export const getGroupChatDetails = async (req: Request, res: Response) => {
  const { groupId } = req.params;

  try {
    const groupChat = await GroupChat.findById(groupId)
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
  } catch (error) {
    console.error("Error fetching group chat details:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get group chat details
export const getGroupChatsForUser = async (req: Request, res: Response) => {
  const userId = req.user?._id;

  try {
    const chats = await GroupChat.find({ participants: userId })
      .populate("participants", "name email") // Populating participants with name and email
      .populate("lastMessage", "text createdAt sender readBy"); // Populating lastMessage with text, createdAt, and sender

    res.status(200).json({
      success: true,
      data: chats,
    });
  } catch (error) {
    console.error("Error fetching chats for user:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
