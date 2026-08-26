import assert from "node:assert/strict";
import { test } from "node:test";
import { jobStepSchemas, jobWriteSchema } from "./validation";

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
