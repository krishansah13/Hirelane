import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    postedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    requirements: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["part-time", "contract", "full-time", "internship"],
      required: true,
    },

    isRemote: {
      type: Boolean,
      default: null,
    },

    salaryMin: {
      type: Number,
      required: true,
    },

    salaryMax: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "expired"],
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    // Optional expected joining date
    joiningDate: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Job =
  mongoose.models.Job || mongoose.model("Job", jobSchema);

if (!Job.schema.path("skills")) {
  Job.schema.add({
    skills: {
      type: [String],
      default: [],
    },
  });
}

if (!Job.schema.path("requirements")) {
  Job.schema.add({
    requirements: {
      type: String,
      default: "",
    },
  });
}

export default Job;