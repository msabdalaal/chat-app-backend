"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const authMiddleware_1 = require("../middleware/authMiddleware");
const userRoutes = express_1.default.Router();
// Register a new user
userRoutes.post("/register", user_1.registerUser);
// Login user
userRoutes.post("/login", user_1.loginUser);
// Logout user
userRoutes.post("/logout", user_1.logOutUser);
// Get user profile (protected route)
userRoutes.get("/profile", authMiddleware_1.protect, user_1.getUserProfile);
// Get user profile (protected route)
userRoutes.get("/search/:query", authMiddleware_1.protect, user_1.searchUsers);
exports.default = userRoutes;
