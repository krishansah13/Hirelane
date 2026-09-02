import mongoose, { Schema } from "mongoose";

const resumeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    originalFilename: {
      type: String,
      default: "",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

resumeSchema.index({ userId: 1, createdAt: -1 });

const Resume =
  mongoose.models.Resume || mongoose.model("Resume", resumeSchema);

export default Resume;
