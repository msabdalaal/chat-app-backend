import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Helper function to create a token and set it in cookies
const createTokenAndSetCookie = (res: Response, userId: string) => {
  // Generate a JWT token that expires in 2 days
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "2d" });

  // Set the token as a cookie with httpOnly and secure options
  res.cookie("token", token, {
    httpOnly: false, // Prevent client-side JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === "production", // Only use secure cookies in production
    expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days expiration
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Set sameSite to none in production, lax in development
  });
};

// Register a new user
export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create a new user
    const user = new User({
      name,
      email,
      password,
    });

    // Save the user to the database
    await user.save();

    // Set the JWT token in a cookie, casting ObjectId to string
    createTokenAndSetCookie(res, user.id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error Registering in:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// User login
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Set the JWT token in a cookie, casting ObjectId to string
    createTokenAndSetCookie(res, user.id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const logOutUser = async (req: Request, res: Response) => {
  res.cookie("token", "", {
    httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === "production", // Only use secure cookies in production
    maxAge: 1, // 2 days expiration
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // CSRF protection
  });
  res.status(200).json({
    success: true,
    message: "Logout Successfully",
  });
};
// Get user profile (protected route)
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        status: req.user.status,
      },
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Search users by email query (case-insensitive, selecting specific fields)
export const searchUsers = async (req: Request, res: Response) => {
  const { query } = req.params;

  try {
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    // Find users whose email starts with the query string (case-insensitive) and select specific fields
    let users = await User.find({
      email: { $regex: `^${query}`, $options: "i" }, // Case-insensitive match
    }).select("name email _id"); // Only select name, email, and _id

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }

    //exclude the user himself
    users = users.filter((user) => user._id != req.user?.id);
    // Return the list of matched users with only selected fields
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error searching for users:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
