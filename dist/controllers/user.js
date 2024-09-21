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
exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
// Helper function to create a token and set it in cookies
const createTokenAndSetCookie = (res, userId) => {
    // Generate a JWT token that expires in 2 days
    const token = jsonwebtoken_1.default.sign({ id: userId }, JWT_SECRET, { expiresIn: "2d" });
    // Set the token as a cookie with httpOnly and secure options
    res.cookie("token", token, {
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === "production", // Only use secure cookies in production
        expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days expiration
        sameSite: "strict", // CSRF protection
    });
};
// Register a new user
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        // Check if user already exists
        const existingUser = yield user_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }
        // Create a new user
        const user = new user_1.default({
            name,
            email,
            password,
        });
        // Save the user to the database
        yield user.save();
        // Set the JWT token in a cookie, casting ObjectId to string
        createTokenAndSetCookie(res, user.id);
        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            },
        });
    }
    catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.registerUser = registerUser;
// User login
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Find the user by email
        const user = yield user_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Compare passwords
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
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
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            },
        });
    }
    catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.loginUser = loginUser;
// Get user profile (protected route)
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    status: req.user.status,
                },
            },
        });
    }
    catch (error) {
        console.error("Error getting user profile:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.getUserProfile = getUserProfile;
