import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  logOutUser,
  searchUsers,
} from "../controllers/user";
import { protect } from "../middleware/authMiddleware";

const userRoutes = express.Router();

// Register a new user
userRoutes.post("/register", registerUser);

// Login user
userRoutes.post("/login", loginUser);

// Logout user
userRoutes.post("/logout", logOutUser);

// Get user profile (protected route)
userRoutes.get("/profile", protect, getUserProfile);

// Get user profile (protected route)
userRoutes.get("/search/:query", protect, searchUsers);

export default userRoutes;
