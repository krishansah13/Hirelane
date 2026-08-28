import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["seeker", "employer", "admin"],
      required: true,
      default: "seeker",
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    companyId: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: "Company",
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
