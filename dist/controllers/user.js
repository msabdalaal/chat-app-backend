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
exports.searchUsers = exports.getUserProfile = exports.logOutUser = exports.loginUser = exports.registerUser = void 0;
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
        httpOnly: false, // Prevent client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === "production", // Only use secure cookies in production
        expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days expiration
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Set sameSite to none in production, lax in development
    });
};
// Register a new user
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        // Check if user already exists
        const existingUser = yield user_1.default.findOne({ email });
        console.log(existingUser);
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
                _id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error("Error Registering in:", error);
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
                _id: user._id,
                name: user.name,
                email: user.email,
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
const logOutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.logOutUser = logOutUser;
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
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                status: req.user.status,
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
// Search users by email query (case-insensitive, selecting specific fields)
const searchUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.params;
    try {
        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Query is required",
            });
        }
        // Find users whose email starts with the query string (case-insensitive) and select specific fields
        let users = yield user_1.default.find({
            email: { $regex: `^${query}`, $options: "i" }, // Case-insensitive match
        }).select("name email _id"); // Only select name, email, and _id
        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found",
            });
        }
        //exclude the user himself
        users = users.filter((user) => { var _a; return user._id != ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id); });
        // Return the list of matched users with only selected fields
        res.status(200).json({
            success: true,
            data: users,
        });
    }
    catch (error) {
        console.error("Error searching for users:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.searchUsers = searchUsers;
