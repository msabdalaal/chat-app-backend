import Presence from "../models/presence";
import mongoose from "mongoose";

// Mark user as online
export const setUserOnline = async (userId: mongoose.Types.ObjectId) => {
  try {
    let presence = await Presence.findOne({ userId });

    if (!presence) {
      // If no presence record exists, create a new one
      presence = new Presence({ userId, isOnline: true });
    } else {
      // Update existing presence
      presence.isOnline = true;
      presence.lastActive = new Date();
    }

    await presence.save();
  } catch (error) {
    console.error("Error setting user online:", error);
  }
};

// Mark user as offline
export const setUserOffline = async (userId: mongoose.Types.ObjectId) => {
  try {
    const presence = await Presence.findOne({ userId });

    if (presence) {
      presence.isOnline = false;
      presence.lastActive = new Date(); // Store the last active timestamp
      await presence.save();
    }
  } catch (error) {
    console.error("Error setting user offline:", error);
  }
};

// Get presence of a user
export const getUserPresence = async (userId: mongoose.Types.ObjectId) => {
  try {
    const presence = await Presence.findOne({ userId });
    return presence;
  } catch (error) {
    console.error("Error getting user presence:", error);
    return null;
  }
};
