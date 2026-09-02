import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applySchema,
  jobStepSchemas,
  jobWriteSchema,
  saveResumeSchema,
  signupSchema,
  tomorrowLocalISO,
} from "./validation";

const roleStep = jobStepSchemas[0];

function validRole() {
  return {
    title: "Frontend Developer",
    description: "Build and ship polished product features with the team.",
    skills: "React, TypeScript, CSS",
    requirements:
      "3+ years of frontend experience and a strong portfolio of shipped UI work.",
  };
}

test("role step accepts title, description, skills, and requirements", () => {
  const result = roleStep.safeParse(validRole());
  assert.equal(result.success, true);
});

test("role step still requires a title and description", () => {
  const result = roleStep.safeParse({
    ...validRole(),
    title: "Hi",
    description: "Too short",
  });
  assert.equal(result.success, false);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => String(issue.path[0]));
    assert.ok(fields.includes("title"));
    assert.ok(fields.includes("description"));
  }
});

test("role step requires at least one skill", () => {
  const result = roleStep.safeParse({
    ...validRole(),
    skills: "   ,  ,",
  });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.issues[0]?.path[0], "skills");
  }
});

test("role step rejects more than 15 skills", () => {
  const skills = Array.from(
    { length: 16 },
    (_, i) => `Skill ${String.fromCharCode(65 + i)}`,
  ).join(", ");
  const result = roleStep.safeParse({
    ...validRole(),
    skills,
  });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.match(result.error.issues[0]?.message ?? "", /at most 15/i);
  }
});

test("role step requires meaningful requirements copy", () => {
  const result = roleStep.safeParse({
    ...validRole(),
    requirements: "Too short",
  });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.issues[0]?.path[0], "requirements");
  }
});

function validSignup() {
  return {
    name: "  Rahul   Sharma  ",
    email: "  Rahul@Example.com  ",
    password: "Seeker@123",
    role: "seeker" as const,
  };
}

test("signup trims name and lowercases email", () => {
  const result = signupSchema.safeParse(validSignup());
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.name, "Rahul Sharma");
    assert.equal(result.data.email, "rahul@example.com");
  }
});

test("signup rejects names with numbers or symbols", () => {
  assert.equal(
    signupSchema.safeParse({ ...validSignup(), name: "Rahul123" }).success,
    false,
  );
  assert.equal(
    signupSchema.safeParse({ ...validSignup(), name: "Rahul@" }).success,
    false,
  );
});

test("signup requires a strong password", () => {
  assert.equal(
    signupSchema.safeParse({ ...validSignup(), password: "seeker@123" })
      .success,
    false,
  );
  assert.equal(
    signupSchema.safeParse({ ...validSignup(), password: "SEEKER@123" })
      .success,
    false,
  );
  assert.equal(
    signupSchema.safeParse({ ...validSignup(), password: "Seeker123" }).success,
    false,
  );
  assert.equal(
    signupSchema.safeParse({ ...validSignup(), password: "Seeker @123" })
      .success,
    false,
  );
  assert.equal(
    signupSchema.safeParse({ ...validSignup(), password: "Seeker@abc" })
      .success,
    false,
  );
});

test("signup rejects invalid emails", () => {
  assert.equal(
    signupSchema.safeParse({ ...validSignup(), email: "not-an-email" }).success,
    false,
  );
  assert.equal(
    signupSchema.safeParse({ ...validSignup(), email: "user@localhost" })
      .success,
    false,
  );
});

function validJobWrite() {
  return {
    ...validRole(),
    location: "Bengaluru",
    type: "full-time" as const,
    isRemote: "false" as const,
    salaryMin: "800000",
    salaryMax: "1200000",
    joiningDate: "",
    expiresAt: tomorrowLocalISO(),
    publish: "false" as const,
  };
}

test("full job schema still enforces salary range", () => {
  const result = jobWriteSchema.safeParse({
    ...validJobWrite(),
    salaryMax: "500000",
  });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.issues[0]?.path[0], "salaryMax");
  }
});

test("title and location allow only letters, spaces, and hyphens", () => {
  assert.equal(
    roleStep.safeParse({ ...validRole(), title: "Engineer 2" }).success,
    false,
  );
  assert.equal(
    roleStep.safeParse({ ...validRole(), title: "Full-stack Engineer" })
      .success,
    true,
  );

  const locationStep = jobStepSchemas[1];
  assert.equal(
    locationStep.safeParse({
      location: "Bengaluru 12",
      type: "full-time",
      isRemote: "false",
    }).success,
    false,
  );
  assert.equal(
    locationStep.safeParse({
      location: "New Delhi",
      type: "full-time",
      isRemote: "false",
    }).success,
    true,
  );
});

test("joining and expiry dates must be tomorrow or later", () => {
  const compensation = jobStepSchemas[2];
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const pastExpiry = compensation.safeParse({
    salaryMin: "800000",
    salaryMax: "1200000",
    joiningDate: "",
    expiresAt: todayISO,
  });
  assert.equal(pastExpiry.success, false);

  const pastJoin = compensation.safeParse({
    salaryMin: "800000",
    salaryMax: "1200000",
    joiningDate: todayISO,
    expiresAt: tomorrowLocalISO(),
  });
  assert.equal(pastJoin.success, false);

  const valid = compensation.safeParse({
    salaryMin: "800000",
    salaryMax: "1200000",
    joiningDate: tomorrowLocalISO(),
    expiresAt: tomorrowLocalISO(),
  });
  assert.equal(valid.success, true);
});

const cloudinaryResume =
  "https://res.cloudinary.com/demo/raw/upload/v1710000000/hirelane/resumes/resume-1.pdf";

test("apply schema accepts a Cloudinary resume URL", () => {
  const result = applySchema.safeParse({
    jobId: "64b0f2c2a1b2c3d4e5f60789",
    resumeURL: cloudinaryResume,
  });
  assert.equal(result.success, true);
});

test("apply schema accepts a saved resume id without an upload URL", () => {
  const result = applySchema.safeParse({
    jobId: "64b0f2c2a1b2c3d4e5f60789",
    resumeId: "64b0f2c2a1b2c3d4e5f60780",
  });
  assert.equal(result.success, true);
});

test("apply schema requires a resume", () => {
  const result = applySchema.safeParse({
    jobId: "64b0f2c2a1b2c3d4e5f60789",
  });
  assert.equal(result.success, false);
});

test("apply schema rejects a non-Cloudinary resume URL", () => {
  const result = applySchema.safeParse({
    jobId: "64b0f2c2a1b2c3d4e5f60789",
    resumeURL: "https://example.com/resume.pdf",
  });
  assert.equal(result.success, false);
});

test("save resume schema requires a name and Cloudinary URL", () => {
  const valid = saveResumeSchema.safeParse({
    url: cloudinaryResume,
    label: "Software engineer resume",
    originalFilename: "resume.pdf",
    isDefault: "true",
  });
  assert.equal(valid.success, true);

  const missingName = saveResumeSchema.safeParse({
    url: cloudinaryResume,
    label: "  ",
  });
  assert.equal(missingName.success, false);

  const collapsed = saveResumeSchema.safeParse({
    url: cloudinaryResume,
    label: "  Software   Engineer  ",
  });
  assert.equal(collapsed.success, true);
  if (collapsed.success) {
    assert.equal(collapsed.data.label, "Software Engineer");
  }

  const punctuationOnly = saveResumeSchema.safeParse({
    url: cloudinaryResume,
    label: "---",
  });
  assert.equal(punctuationOnly.success, false);
});

