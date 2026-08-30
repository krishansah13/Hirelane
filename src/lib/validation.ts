import { z } from "zod";
import {
  MAX_SKILL_LENGTH,
  MAX_SKILLS,
  MIN_SKILL_LENGTH,
  parseSkillList,
} from "./utils/skills";

export const jobQuerySchema = z.object({
  q: z.string().optional(),

  location: z.string().optional(),

  type: z
    .enum(["part-time", "contract", "full-time", "internship"])
    .optional(),

  remote: z.enum(["true", "false", "any"]).optional(),

  sort: z.enum(["newest", "oldest"]).optional(),

  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid id");

export const applySchema = z.object({
  jobId: objectIdSchema,

  resumeURL: z.string().url(),

  coverNote: z.string().max(2000).optional(),
});

const salaryRule = {
  message: "Maximum salary must be at least the minimum salary",
  path: ["salaryMax"],
};

const jobWriteFields = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be 120 characters or fewer"),

  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .max(8000, "Description must be 8000 characters or fewer"),

  skills: z
    .string()
    .trim()
    .min(1, "Add at least one skill")
    .superRefine((value, ctx) => {
      const skills = parseSkillList(value);

      if (skills.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Add at least one skill",
        });
        return;
      }

      if (skills.length > MAX_SKILLS) {
        ctx.addIssue({
          code: "custom",
          message: `Add at most ${MAX_SKILLS} skills`,
        });
        return;
      }

      for (const skill of skills) {
        if (skill.length < MIN_SKILL_LENGTH) {
          ctx.addIssue({
            code: "custom",
            message: `Each skill must be at least ${MIN_SKILL_LENGTH} characters`,
          });
          return;
        }

        if (skill.length > MAX_SKILL_LENGTH) {
          ctx.addIssue({
            code: "custom",
            message: `Each skill must be ${MAX_SKILL_LENGTH} characters or fewer`,
          });
          return;
        }
      }
    }),

  requirements: z
    .string()
    .trim()
    .min(20, "Requirements must be at least 20 characters")
    .max(4000, "Requirements must be 4000 characters or fewer"),

  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters")
    .max(120, "Location must be 120 characters or fewer"),

  type: z.enum(
    ["part-time", "contract", "full-time", "internship"],
    {
      message: "Choose a job type",
    },
  ),

  isRemote: z.enum(["true", "false"], {
    message: "Choose a work mode",
  }),

  salaryMin: z.coerce
    .number({
      message: "Minimum salary must be a number",
    })
    .int("Minimum salary must be a whole number")
    .positive("Minimum salary must be greater than 0"),

  salaryMax: z.coerce
    .number({
      message: "Maximum salary must be a number",
    })
    .int("Maximum salary must be a whole number")
    .positive("Maximum salary must be greater than 0"),

  // Optional joining date
  joiningDate: z
    .string()
    .refine(
      (value) => {
        // Empty value is allowed because joining date is optional
        if (!value) return true;

        return !Number.isNaN(Date.parse(value));
      },
      {
        message: "Choose a valid joining date",
      },
    )
    .optional(),

  expiresAt: z.string().min(1, "Choose an expiry date"),

  publish: z.enum(["true", "false"]).optional(),
});

export const jobWriteSchema = jobWriteFields.refine(
  (data) => data.salaryMax >= data.salaryMin,
  salaryRule,
);

/**
 * One schema per wizard step so the client can block Continue using the exact
 * rules the Server Action re-checks.
 */
export const jobStepSchemas = [
  jobWriteFields.pick({
    title: true,
    description: true,
    skills: true,
    requirements: true,
  }),

  jobWriteFields.pick({
    location: true,
    type: true,
    isRemote: true,
  }),

  jobWriteFields
    .pick({
      salaryMin: true,
      salaryMax: true,
      joiningDate: true,
      expiresAt: true,
    })
    .refine(
      (data) => data.salaryMax >= data.salaryMin,
      salaryRule,
    ),
] as const;

export const JOB_FIELD_STEP: Record<string, number> = {
  title: 0,
  description: 0,
  skills: 0,
  requirements: 0,

  location: 1,
  type: 1,
  isRemote: 1,

  salaryMin: 2,
  salaryMax: 2,
  joiningDate: 2,
  expiresAt: 2,
};

export const jobIdSchema = z.object({
  jobId: objectIdSchema,
});

export const stageSchema = z.enum([
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
]);

export const updateStageSchema = z.object({
  applicationId: objectIdSchema,

  stage: stageSchema,
});

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be 100 characters or fewer");

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(80, "Name must be 80 characters or fewer"),

    email: z.email("Enter a valid email").trim().toLowerCase(),

    password: passwordSchema,

    role: z.enum(["seeker", "employer"], {
      message: "Choose a role",
    }),

    companyName: z.string().trim().optional(),

    companyWebsite: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== "employer") return;

    if (!data.companyName || data.companyName.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["companyName"],
        message: "Company name must be at least 2 characters",
      });
    }

    const website = data.companyWebsite ?? "";

    if (!website) {
      ctx.addIssue({
        code: "custom",
        path: ["companyWebsite"],
        message: "Enter your company website",
      });
    }
  });

function emptyToUndefined(value: unknown) {
  if (value == null) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

export const adminUserQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
  role: z.preprocess(
    emptyToUndefined,
    z.enum(["seeker", "employer", "admin"]).optional(),
  ),
  status: z.preprocess(
    emptyToUndefined,
    z.enum(["active", "suspended"]).optional(),
  ),
  page: z.coerce.number().int().positive().default(1),
});

export const setUserStatusSchema = z.object({
  userId: objectIdSchema,
  status: z.enum(["active", "suspended"]),
});

export const adminJobQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
  status: z.preprocess(
    emptyToUndefined,
    z.enum(["draft", "published", "expired"]).optional(),
  ),
  type: z.preprocess(
    emptyToUndefined,
    z.enum(["part-time", "contract", "full-time", "internship"]).optional(),
  ),
  remote: z.preprocess(
    emptyToUndefined,
    z.enum(["true", "false", "any"]).optional(),
  ),
  page: z.coerce.number().int().positive().default(1),
});

export const adminCompanyQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
  page: z.coerce.number().int().positive().default(1),
});

export const updateAdminCompanySchema = z.object({
  companyId: objectIdSchema,
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer"),
  website: z.string().trim().min(1, "Enter a company website"),
  about: z
    .string()
    .trim()
    .max(2000, "About must be 2000 characters or fewer")
    .optional(),
});

export const createAdminCompanySchema = updateAdminCompanySchema.omit({
  companyId: true,
});

export const createAdminEmployerSchema = z.object({
  companyId: objectIdSchema,
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer"),
  email: z.email("Enter a valid email").trim().toLowerCase(),
  password: passwordSchema,
});

export function normalizeMobile(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export const accountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer"),

  mobile: z
    .string()
    .trim()
    .transform(normalizeMobile)
    .refine((value) => value === "" || /^[6-9]\d{9}$/.test(value), {
      message: "Enter a valid 10-digit mobile number",
    }),

  image: z
    .union([z.string().url("Invalid profile photo"), z.literal("")])
    .optional(),
});

export type JobQueryInput = z.infer<typeof jobQuerySchema>;
export type AdminUserQueryInput = z.infer<typeof adminUserQuerySchema>;
export type AdminJobQueryInput = z.infer<typeof adminJobQuerySchema>;
export type AdminCompanyQueryInput = z.infer<typeof adminCompanyQuerySchema>;

export type ApplicationStage = z.infer<typeof stageSchema>;

export type SignupInput = z.infer<typeof signupSchema>;