"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notification_1 = require("../controllers/notification");
const authMiddleware_1 = require("../middleware/authMiddleware"); // Auth middleware
const notificationRoutes = express_1.default.Router();
// Get all unread notifications for the current user
notificationRoutes.get("/unread", authMiddleware_1.protect, notification_1.getUnreadNotifications);
// Mark all unread notifications as read for the current user
notificationRoutes.patch("/markAsRead", authMiddleware_1.protect, notification_1.markNotificationsAsRead);
exports.default = notificationRoutes;
