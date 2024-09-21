import mongoose, { Schema } from "mongoose";
import { INotification } from "../types";


const notificationSchema: Schema<INotification> = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model<INotification>("Notification", notificationSchema);
export default Notification;
