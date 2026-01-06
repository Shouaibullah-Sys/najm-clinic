// lib/models/User.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "admin" | "ceo" | "laboratory" | "pharmacy";
  approved: boolean;
  avatar?: string;
  refreshTokens?: string[];
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "ceo", "laboratory", "pharmacy"],
    default: "laboratory",
  },
  approved: { type: Boolean, default: false },
  avatar: { type: String },
  refreshTokens: { type: [String], default: [] },
});

// Use named export
export const User = models.User || model<IUser>("User", userSchema);
