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
    image: {
      type: String,
      default: "",
    },
    mobile: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

if (!User.schema.path("image")) {
  User.schema.add({ image: { type: String, default: "" } });
}
if (!User.schema.path("mobile")) {
  User.schema.add({ mobile: { type: String, default: "" } });
}

export default User;
