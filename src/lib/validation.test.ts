import assert from "node:assert/strict";
import { test } from "node:test";
import { jobStepSchemas, jobWriteSchema, signupSchema } from "./validation";

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
  const skills = Array.from({ length: 16 }, (_, i) => `Skill ${i + 1}`).join(
    ", ",
  );
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

test("full job schema still enforces salary range", () => {
  const result = jobWriteSchema.safeParse({
    ...validRole(),
    location: "Bengaluru",
    type: "full-time",
    isRemote: "false",
    salaryMin: "800000",
    salaryMax: "500000",
    joiningDate: "",
    expiresAt: "2026-12-31",
    publish: "false",
  });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.issues[0]?.path[0], "salaryMax");
  }
});
