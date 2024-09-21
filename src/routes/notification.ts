import express from "express";
import { getUnreadNotifications, markNotificationsAsRead } from "../controllers/notification";
import { protect } from "../middleware/authMiddleware"; // Auth middleware

const notificationRoutes = express.Router();

// Get all unread notifications for the current user
notificationRoutes.get("/unread", protect, getUnreadNotifications);

// Mark all unread notifications as read for the current user
notificationRoutes.patch("/markAsRead", protect, markNotificationsAsRead);

export default notificationRoutes;
