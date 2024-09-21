import mongoose, { Schema, CallbackError } from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator"; // Validator for email validation
import { IUser } from "../types";

// Password regex for validation
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    status: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

userSchema.pre<IUser>(
  "save",
  async function (next: (err?: CallbackError) => void) {
    if (!this.isModified("password")) return next();

    if (!passwordRegex.test(this.password)) {
      return next(
        new Error(
          "Password validation failed: Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
        ) as CallbackError
      );
    }

    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (err) {
      next(err as CallbackError); // Casting the error to CallbackError
    }
  }
);

// Method to compare password during login
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Export the User model
const User = mongoose.model<IUser>("User", userSchema);
export default User;
