import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  status: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  readBy: mongoose.Types.ObjectId[]; // Array of user IDs who have read the message
}

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[]; // Users involved in the chat
  lastMessage: mongoose.Types.ObjectId; // Reference to the last message
  updatedAt: Date;
}

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId; // The user receiving the notification
  message: mongoose.Types.ObjectId; // Reference to the message that triggered the notification
  chat: mongoose.Types.ObjectId; // Reference to the chat
  isRead: boolean; // Whether the notification has been read
  createdAt: Date;
}


export interface IPresence extends Document {
  userId: mongoose.Types.ObjectId;
  isOnline: boolean;
  lastActive: Date;
}

export interface IGroupChat extends Document {
  participants: mongoose.Types.ObjectId[];
  admin: mongoose.Types.ObjectId;
  groupName: string;
  groupImage: string;
  lastMessage: mongoose.Types.ObjectId;
}
