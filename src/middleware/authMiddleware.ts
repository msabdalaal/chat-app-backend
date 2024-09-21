import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Middleware to protect routes using JWT stored in cookies
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string;

  // Check if the token is available in cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token; // Get the token from cookies

    try {
      // Verify token
      const decoded: any = jwt.verify(token, JWT_SECRET);

      // Attach the user to the request object (exclude password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "User not found" });
      }

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error("Not authorized, token failed", error);
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
    }
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }
};
