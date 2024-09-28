import mongoose, { Document, Schema } from "mongoose";
import { IGroupChat } from "../types";

const groupChatSchema: Schema<IGroupChat> = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groupName: { type: String, required: true },
    groupImage: { type: String, default: "" },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
      default: null,
    },
  },
  { timestamps: true }
);

const GroupChat = mongoose.model<IGroupChat>("GroupChat", groupChatSchema);
export default GroupChat;
