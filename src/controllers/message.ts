import { Request, Response } from "express";
import Message from "../models/message";
import Chat from "../models/chat";
import mongoose from "mongoose"; // Import mongoose for ObjectId type
import { createNotification } from "./notification";
import GroupChat from "../models/groupChat";

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

export const createMessage = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { text } = req.body;

  try {
    const chat = await Chat.findById(chatId);
    const groupChat = await GroupChat.findById(chatId);
    const currentChat = chat ? chat : groupChat;

    // Check if chat exists
    if (!currentChat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Create a new message
    let message = new Message({
      chatId,
      sender: req.user?._id,
      text,
      readBy: [`${req.user?._id}`],
    });

    // Save the message to the database
    await message.save();
    message = await message.populate("sender", "_id name email");
    // Notify all participants except the sender
    const chatObjectId = new mongoose.Types.ObjectId(chatId);
    const userObjectId = new mongoose.Types.ObjectId(req.user?._id?.toString());
    currentChat.participants.forEach((participant: any) => {
      if (!participant.equals(userObjectId)) {
        createNotification(participant, message.id, chatObjectId);
      }
    });

    // Update the last message in the chat
    currentChat.lastMessage = message.id;
    await currentChat.save();

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
    // Find and delete the message
    const message = await Message.findByIdAndDelete(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Find the chat that contains this message
    const chat = await Chat.findById(message.chatId);
    const groupChat = await GroupChat.findById(message.chatId);
    const currentChat = chat ? chat : groupChat;

    // Check if chat exists
    if (!currentChat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Check if the deleted message was the last message in the chat
    if (
      currentChat.lastMessage &&
      currentChat.lastMessage.toString() === message.id.toString()
    ) {
      // Find the most recent message before the deleted one
      const previousMessage = await Message.findOne({
        chatId: currentChat._id,
        _id: { $lt: message._id }, // Find the message with an ID less than the deleted one
      }).sort({ _id: -1 }); // Sort by ID in descending order to get the most recent one

      // Update the lastMessage field in the chat document
      currentChat.lastMessage = previousMessage ? previousMessage.id : null;
      await currentChat.save();
    }

    res.status(200).json({
      success: true,
      data: message,
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
