import { Request, Response } from "express";
import Message from "../models/message";
import Chat from "../models/chat";
import mongoose from "mongoose"; // Import mongoose for ObjectId type

// Get all messages for a specific chat
export const getMessagesForChat = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chatId }).populate(
      "sender",
      "name email"
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages for chat:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Create a message and add it to an existing chat
export const createMessage = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { text } = req.body;

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Create a new message
    const message = new Message({
      chatId,
      sender: req.user?._id,
      text,
      readBy: [`${req.user?._id}`],
    });

    // Save the message to the database
    await message.save();

    // Update the last message in the chat
    chat.lastMessage = message.id;
    await chat.save();

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Mark all unread messages as read by the current user when entering a chat
export const markAllMessagesAsRead = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  try {
    // Find all unread messages in the chat that the current user hasn't read
    const unreadMessages = await Message.find({
      chatId,
      readBy: { $ne: req.user?._id }, // Find messages where the user hasn't read
    });

    if (unreadMessages.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No unread messages",
        data: [],
      });
    }

    // Mark each unread message as read by adding the user's ID to the readBy array
    const userId = new mongoose.Types.ObjectId(req.user?._id?.toString());
    const updatedMessages = await Message.updateMany(
      { chatId, readBy: { $ne: userId } }, // Only update unread messages for this user
      { $push: { readBy: userId } }, // Add userId to readBy array
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `${updatedMessages.modifiedCount} messages marked as read`,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// Delete a message
export const deleteMessage = async (req: Request, res: Response) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findByIdAndDelete(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
