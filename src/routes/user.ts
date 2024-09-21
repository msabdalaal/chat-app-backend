import express from "express";
import { registerUser, loginUser, getUserProfile } from "../controllers/user";
import { protect } from "../middleware/authMiddleware";

const userRoutes = express.Router();

// Register a new user
userRoutes.post("/register", registerUser);

// Login user
userRoutes.post("/login", loginUser);

// Get user profile (protected route)
userRoutes.get("/profile", protect, getUserProfile);

export default userRoutes;
