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
      enum: ["active", "suspended", "pending"],
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

function statusAllowsPending(model: mongoose.Model<unknown>) {
  const path = model.schema.path("status") as unknown as {
    validators?: { type?: string; enumValues?: unknown }[];
  } | undefined;
  const allowed = path?.validators?.find((validator) => validator.type === "enum")
    ?.enumValues;
  return Array.isArray(allowed) && allowed.includes("pending");
}

const cached = mongoose.models.User as mongoose.Model<unknown> | undefined;
if (cached && !statusAllowsPending(cached)) {
  mongoose.deleteModel("User");
}

const User = mongoose.models.User || mongoose.model("User", userSchema);

if (!User.schema.path("image")) {
  User.schema.add({ image: { type: String, default: "" } });
}
if (!User.schema.path("mobile")) {
  User.schema.add({ mobile: { type: String, default: "" } });
}

export default User;
