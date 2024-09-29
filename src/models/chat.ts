import mongoose, { Schema } from "mongoose";
import { IChat } from "../types";

const chatSchema: Schema<IChat> = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model<IChat>("Chat", chatSchema);
export default Chat;
