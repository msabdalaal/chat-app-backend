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
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
// Middleware to protect routes using JWT stored in cookies
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    // Check if the token is available in cookies
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token; // Get the token from cookies
        try {
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // Attach the user to the request object (exclude password)
            req.user = yield user_1.default.findById(decoded.id).select("-password");
            if (!req.user) {
                return res
                    .status(401)
                    .json({ success: false, message: "User not found" });
            }
            // Proceed to the next middleware or route handler
            next();
        }
        catch (error) {
            console.error("Not authorized, token failed", error);
            return res
                .status(401)
                .json({ success: false, message: "Not authorized, token failed" });
        }
    }
    else {
        return res
            .status(401)
            .json({ success: false, message: "Not authorized, no token" });
    }
});
exports.protect = protect;
