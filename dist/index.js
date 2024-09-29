"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser")); // Import cookie-parser
require("./db/mongoose"); // Assuming this connects to MongoDB
dotenv_1.default.config();
const user_1 = __importDefault(require("./routes/user"));
const chat_1 = __importDefault(require("./routes/chat"));
const message_1 = __importDefault(require("./routes/message"));
const groupChat_1 = __importDefault(require("./routes/groupChat"));
const notification_1 = __importDefault(require("./routes/notification"));
const socket_1 = require("./socket/socket");
const port = process.env.PORT || 3000;
socket_1.app.use((0, cookie_parser_1.default)());
socket_1.app.use(express_1.default.json());
socket_1.app.use((0, cors_1.default)({
    origin: ((_a = process.env.CORS_ORIGIN) === null || _a === void 0 ? void 0 : _a.split(",")) || "*",
    credentials: true,
}));
socket_1.app.use("/api/users", user_1.default);
socket_1.app.use("/api/chats", chat_1.default);
socket_1.app.use("/api/groupChats", groupChat_1.default);
socket_1.app.use("/api/messages", message_1.default);
socket_1.app.use("/api/notification", notification_1.default);
socket_1.server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
