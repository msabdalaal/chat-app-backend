"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPresence = exports.setUserOffline = exports.setUserOnline = void 0;
const presence_1 = __importDefault(require("../models/presence"));
// Mark user as online
const setUserOnline = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let presence = yield presence_1.default.findOne({ userId });
        if (!presence) {
            // If no presence record exists, create a new one
            presence = new presence_1.default({ userId, isOnline: true });
        }
        else {
            // Update existing presence
            presence.isOnline = true;
            presence.lastActive = new Date();
        }
        yield presence.save();
    }
    catch (error) {
        console.error("Error setting user online:", error);
    }
});
exports.setUserOnline = setUserOnline;
// Mark user as offline
const setUserOffline = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const presence = yield presence_1.default.findOne({ userId });
        if (presence) {
            presence.isOnline = false;
            presence.lastActive = new Date(); // Store the last active timestamp
            yield presence.save();
        }
    }
    catch (error) {
        console.error("Error setting user offline:", error);
    }
});
exports.setUserOffline = setUserOffline;
// Get presence of a user
const getUserPresence = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const presence = yield presence_1.default.findOne({ userId });
        return presence;
    }
    catch (error) {
        console.error("Error getting user presence:", error);
        return null;
    }
});
exports.getUserPresence = getUserPresence;
