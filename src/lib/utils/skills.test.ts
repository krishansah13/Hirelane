import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSkillList, serializeSkillList } from "./skills";

test("parseSkillList splits commas and newlines", () => {
  assert.deepEqual(parseSkillList("React, TypeScript\nNode.js"), [
    "React",
    "TypeScript",
    "Node.js",
  ]);
});

test("parseSkillList trims, collapses spaces, and drops blanks", () => {
  assert.deepEqual(parseSkillList("  React  ,  , Type  Script  "), [
    "React",
    "Type Script",
  ]);
});

test("parseSkillList de-duplicates case-insensitively", () => {
  assert.deepEqual(parseSkillList("React, react, REACT"), ["React"]);
});

test("parseSkillList accepts an existing array", () => {
  assert.deepEqual(parseSkillList(["React", " React ", ""]), ["React"]);
});

test("serializeSkillList joins skills for the form", () => {
  assert.equal(serializeSkillList(["React", "TypeScript"]), "React, TypeScript");
  assert.equal(serializeSkillList(null), "");
});
