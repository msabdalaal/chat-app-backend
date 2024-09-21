"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cookie_parser_1 = __importDefault(require("cookie-parser")); // Import cookie-parser
require("./db/mongoose"); // Assuming this connects to MongoDB
dotenv_1.default.config();
const user_1 = __importDefault(require("./routes/user"));
const chat_1 = __importDefault(require("./routes/chat"));
const message_1 = __importDefault(require("./routes/message"));
const groupChat_1 = __importDefault(require("./routes/groupChat"));
const port = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)()); // Use cookie-parser middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ((_a = process.env.CORS_ORIGIN) === null || _a === void 0 ? void 0 : _a.split(",")) || "*",
    credentials: true,
}));
app.use("/api/users", user_1.default);
app.use("/api/chats", chat_1.default);
app.use("/api/groupChats", groupChat_1.default);
app.use("/api/messages", message_1.default);
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ((_b = process.env.CORS_ORIGIN) === null || _b === void 0 ? void 0 : _b.split(",")) || "*",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    // Join a chat room
    socket.on("joinChat", (chatId) => {
        socket.join(chatId);
        console.log(`User joined chat: ${chatId}`);
    });
    // Listen for messages
    socket.on("sendMessage", (messageData) => {
        const { chatId, senderId, text } = messageData;
        console.log(`Received message from ${senderId} in chat ${chatId}: ${text}`);
        // Emit message to the chat room
        io.to(chatId).emit("message", messageData);
    });
    // Typing event: Notify others in the room that the user is typing
    socket.on("typing", ({ chatId, userId }) => {
        socket.to(chatId).emit("userTyping", { userId, isTyping: true });
        console.log(`User ${userId} is typing in chat ${chatId}`);
    });
    // Stop typing event: Notify others in the room that the user stopped typing
    socket.on("stopTyping", ({ chatId, userId }) => {
        socket.to(chatId).emit("userTyping", { userId, isTyping: false });
        console.log(`User ${userId} stopped typing in chat ${chatId}`);
    });
    // Handle user disconnect
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
