import assert from "node:assert/strict";
import { test } from "node:test";
import { canEmployerViewPublicJob, companyIdFromRef } from "./job-access";

test("companyIdFromRef reads a string or populated company", () => {
  assert.equal(companyIdFromRef("abc123"), "abc123");
  assert.equal(companyIdFromRef({ _id: "abc123", name: "Acme" }), "abc123");
  assert.equal(companyIdFromRef(null), null);
  assert.equal(companyIdFromRef({ name: "Acme" }), null);
});

test("employers can only view public pages for their company", () => {
  assert.equal(canEmployerViewPublicJob("abc123", "abc123"), true);
  assert.equal(
    canEmployerViewPublicJob("abc123", { _id: "abc123", name: "Acme" }),
    true,
  );
  assert.equal(canEmployerViewPublicJob("abc123", "other"), false);
  assert.equal(canEmployerViewPublicJob(null, "abc123"), false);
  assert.equal(canEmployerViewPublicJob("abc123", null), false);
});
