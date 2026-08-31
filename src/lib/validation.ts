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

const DATE_INPUT = /^\d{4}-\d{2}-\d{2}$/;
const LETTERS_SPACES_HYPHENS = /^[\p{L}]+(?:[ -][\p{L}]+)*$/u;
const NAME_CHARS_MESSAGE = "Only letters, spaces, and hyphens are allowed";

function localISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function tomorrowLocalISO(from = new Date()) {
  return localISODate(
    new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1),
  );
}

export function isValidDateInput(value: string) {
  if (!DATE_INPUT.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function isOnOrAfterTomorrow(value: string, from = new Date()) {
  return isValidDateInput(value) && value >= tomorrowLocalISO(from);
}

const nameTextSchema = (min: number, max: number, minMessage: string) =>
  z
    .string()
    .trim()
    .min(min, minMessage)
    .max(max, `Must be ${max} characters or fewer`)
    .regex(LETTERS_SPACES_HYPHENS, NAME_CHARS_MESSAGE);

const jobWriteFields = z.object({
  title: nameTextSchema(3, 120, "Title must be at least 3 characters"),

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

        if (!LETTERS_SPACES_HYPHENS.test(skill)) {
          ctx.addIssue({
            code: "custom",
            message: "Skills can only contain letters, spaces, and hyphens",
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

  location: nameTextSchema(2, 120, "Location must be at least 2 characters"),

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

  joiningDate: z
    .string()
    .refine(
      (value) => {
        if (!value) return true;
        return isOnOrAfterTomorrow(value);
      },
      {
        message: "Joining date must be tomorrow or later",
      },
    )
    .optional(),

  expiresAt: z
    .string()
    .min(1, "Choose an expiry date")
    .refine(isOnOrAfterTomorrow, {
      message: "Expiry date must be tomorrow or later",
    }),

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

const personNameSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\s+/g, " ").trim())
  .pipe(
    z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(80, "Name must be 80 characters or fewer")
      .regex(
        /^[\p{L}]+(?: [\p{L}]+)*$/u,
        "Name can only contain letters and spaces",
      ),
  );

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email"))
  .refine((value) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value), {
    message: "Enter a valid email",
  });

export const PASSWORD_CHECKS = [
  {
    id: "length",
    label: "At least 8 characters",
    message: "Password must be at least 8 characters",
    test: (value: string) => value.length >= 8,
  },
  {
    id: "upper",
    label: "One uppercase letter",
    message: "Password must include an uppercase letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: "lower",
    label: "One lowercase letter",
    message: "Password must include a lowercase letter",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    id: "number",
    label: "One number",
    message: "Password must include a number",
    test: (value: string) => /[0-9]/.test(value),
  },
  {
    id: "special",
    label: "One special character",
    message: "Password must include a special character",
    test: (value: string) => /[^A-Za-z0-9\s]/.test(value),
  },
  {
    id: "spaces",
    label: "No spaces",
    message: "Password cannot contain spaces",
    test: (value: string) => value.length > 0 && !/\s/.test(value),
  },
] as const;

const passwordSchema = z
  .string()
  .max(100, "Password must be 100 characters or fewer")
  .superRefine((value, ctx) => {
    const failed = PASSWORD_CHECKS.find((check) => !check.test(value));
    if (!failed) return;
    ctx.addIssue({
      code: "custom",
      message: failed.message,
    });
  });

export const signupSchema = z
  .object({
    name: personNameSchema,

    email: emailSchema,

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
    z.enum(["active", "suspended", "pending"]).optional(),
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
  pendingPage: z.coerce.number().int().positive().optional(),
  activePage: z.coerce.number().int().positive().optional(),
});

export const seekerApplicationQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
  stage: z.preprocess(emptyToUndefined, stageSchema.optional()),
  page: z.coerce.number().int().positive().default(1),
});

export const employerJobQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
  status: z.preprocess(
    emptyToUndefined,
    z.enum(["draft", "published", "expired"]).optional(),
  ),
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
  name: personNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export function normalizeMobile(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export const accountSchema = z.object({
  name: personNameSchema,

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
export type SeekerApplicationQueryInput = z.infer<
  typeof seekerApplicationQuerySchema
>;
export type EmployerJobQueryInput = z.infer<typeof employerJobQuerySchema>;

export type ApplicationStage = z.infer<typeof stageSchema>;

export type SignupInput = z.infer<typeof signupSchema>;