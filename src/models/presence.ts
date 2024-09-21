import mongoose, { Schema } from "mongoose";
import { IPresence } from "../types";


const presenceSchema: Schema<IPresence> = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isOnline: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
  }
);

const Presence = mongoose.model<IPresence>("Presence", presenceSchema);
export default Presence;
