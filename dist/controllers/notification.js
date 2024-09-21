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
exports.markNotificationsAsRead = exports.getUnreadNotifications = exports.createNotification = void 0;
const notification_1 = __importDefault(require("../models/notification"));
// Create a new notification
const createNotification = (recipientId, messageId, chatId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = new notification_1.default({
            recipient: recipientId,
            message: messageId,
            chat: chatId,
        });
        yield notification.save();
    }
    catch (error) {
        console.error("Error creating notification:", error);
    }
});
exports.createNotification = createNotification;
// Get all unread notifications for a user
const getUnreadNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // Assumed req.user is populated by the auth middleware
    try {
        const notifications = yield notification_1.default.find({ recipient: userId, isRead: false })
            .populate("message", "text")
            .populate("chat", "groupName");
        res.status(200).json({
            success: true,
            data: notifications,
        });
    }
    catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.getUnreadNotifications = getUnreadNotifications;
// Mark notifications as read
const markNotificationsAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    try {
        const updated = yield notification_1.default.updateMany({ recipient: userId, isRead: false }, { isRead: true });
        res.status(200).json({
            success: true,
            message: `${updated.modifiedCount} notifications marked as read`,
        });
    }
    catch (error) {
        console.error("Error marking notifications as read:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.markNotificationsAsRead = markNotificationsAsRead;
