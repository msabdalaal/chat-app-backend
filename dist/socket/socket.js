"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.io = exports.app = exports.getReceiverSocketId = void 0;
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ((_a = process.env.CORS_ORIGIN) === null || _a === void 0 ? void 0 : _a.split(",")) || "*",
        credentials: true,
    },
});
exports.io = io;
let userSocketMap = {};
const getReceiverSocketId = (receiverId) => {
    return userSocketMap === null || userSocketMap === void 0 ? void 0 : userSocketMap[receiverId];
};
exports.getReceiverSocketId = getReceiverSocketId;
io.on("connection", (socket) => {
    var _a;
    const userId = socket.handshake.query.userId;
    if (userId)
        userSocketMap[(_a = userId === null || userId === void 0 ? void 0 : userId.toString()) !== null && _a !== void 0 ? _a : ""] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.on("typing", ({ currentChat }) => {
        currentChat.participants.forEach((user) => {
            var _a, _b;
            if (user._id !== userId) {
                io.to(userSocketMap[(_b = (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : ""]).emit("displayTyping", { userId, chatId: currentChat._id });
            }
        });
    });
    socket.on("stopTyping", ({ currentChat }) => {
        currentChat.participants.forEach((user) => {
            var _a, _b;
            if (user._id !== userId) {
                io.to(userSocketMap[(_b = (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : ""]).emit("hideTyping", {
                    userId,
                    chatId: currentChat._id,
                });
            }
        });
    });
    socket.on("disconnect", () => {
        if (userId)
            delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});
