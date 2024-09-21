"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const groupChatSchema = new mongoose_1.default.Schema({
    participants: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    admin: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    groupName: { type: String, required: true },
    groupImage: { type: String, default: "" },
    lastMessage: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Message" },
}, { timestamps: true });
const GroupChat = mongoose_1.default.model("GroupChat", groupChatSchema);
exports.default = GroupChat;
