import { Request, Response } from "express";
import Notification from "../models/notification";
import mongoose from "mongoose";

// Create a new notification
export const createNotification = async (recipientId: mongoose.Types.ObjectId, messageId: mongoose.Types.ObjectId, chatId: mongoose.Types.ObjectId) => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      message: messageId,
      chat: chatId,
    });
    await notification.save();
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// Get all unread notifications for a user
export const getUnreadNotifications = async (req: Request, res: Response) => {
  const userId = req.user?._id; // Assumed req.user is populated by the auth middleware

  try {
    const notifications = await Notification.find({ recipient: userId, isRead: false })
      .populate("message", "text")
      .populate("chat", "groupName");

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Mark notifications as read
export const markNotificationsAsRead = async (req: Request, res: Response) => {
  const userId = req.user?._id;

  try {
    const updated = await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });

    res.status(200).json({
      success: true,
      message: `${updated.modifiedCount} notifications marked as read`,
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
