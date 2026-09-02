import assert from "node:assert/strict";
import { test } from "node:test";
import { cloudinaryPublicIdFromUrl } from "./cloudinary-url";
import { labelFromFilename, MAX_SAVED_RESUMES, isDuplicateResumeLabel } from "./resume";

test("labelFromFilename strips the extension and separators", () => {
  assert.equal(labelFromFilename("Software_Engineer-Resume.pdf"), "Software Engineer Resume");
  assert.equal(labelFromFilename(".pdf"), "Resume");
});

test("duplicate resume names are compared without case or extra spaces", () => {
  const resumes = [
    { id: "1", label: "Software Engineer" },
    { id: "2", label: "Product" },
  ];
  assert.equal(isDuplicateResumeLabel(resumes, "software engineer"), true);
  assert.equal(isDuplicateResumeLabel(resumes, "  Software   Engineer  "), true);
  assert.equal(isDuplicateResumeLabel(resumes, "software engineer", "1"), false);
  assert.equal(isDuplicateResumeLabel(resumes, "Frontend"), false);
});

test("seekers can save a small set of resumes", () => {
  assert.equal(MAX_SAVED_RESUMES, 5);
});

test("cloudinaryPublicIdFromUrl reads the resume public id", () => {
  const url =
    "https://res.cloudinary.com/demo/raw/upload/v1710000000/hirelane/resumes/My-Resume-171.pdf";
  assert.equal(
    cloudinaryPublicIdFromUrl(url),
    "hirelane/resumes/My-Resume-171",
  );
});

test("cloudinaryPublicIdFromUrl ignores non-Cloudinary URLs", () => {
  assert.equal(cloudinaryPublicIdFromUrl("https://example.com/file.pdf"), null);
});
