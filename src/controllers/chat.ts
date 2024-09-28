import { Request, Response } from "express";
import Chat from "../models/chat"; // Assuming the Chat model exists
import User from "../models/user"; // Assuming the User model exists

// Create a new chat between users
export const createChat = async (req: Request, res: Response) => {
  const { participants } = req.body;

  try {
    // Ensure that participants exist and have valid users
    const validUsers = await User.find({ _id: { $in: participants } });

    if (validUsers.length !== participants.length) {
      return res.status(400).json({
        success: false,
        message: "One or more participants are invalid",
      });
    }

    // Create a new chat
    let chat = new Chat({
      participants: [...participants, req.user?._id],
    });

    // Save the chat to the database
    await chat.save();
    chat = await chat.populate("participants", "name email")
    
    res.status(201).json({
      success: true,
      data: chat, // Populating participants with name and email
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all chats for a specific user
export const getChatsForUser = async (req: Request, res: Response) => {
  const userId = req.user?._id;

  try {
    const chats = await Chat.find({ participants: userId })
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
