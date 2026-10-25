// The repository the page derives from its own address (src/site-frame/dashboard-app.mjs deriveTarget). The last accepted text of an
// identifier is MOD-approvals' lastAccepted text (tests/approvals-last-accepted.test.mjs). Deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-review-pages
// Guards: GITLAB PRODUCTS ARE SUPPORTED; A PRODUCT IS NAMED BY ITS ADDRESS
// Level: unit

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect } from "../../src/repository-hosts/index.mjs";
import { deriveTarget } from "../../src/site-frame/dashboard-app.mjs";
import { GL, GL_ADDR } from "./helpers.mjs";

test("the dashboard is opened on a GitLab product by its address; its files link to GitLab", () => {
  const t = deriveTarget({ hostname: "reader.github.io", pathname: "/agent-m/", search: `?product=${encodeURIComponent(GL_ADDR)}` });
  assert.equal(t.instance, "reader/agent-m");
  assert.equal(t.repo, "grp/sub/proj");
  assert.equal(t.product.server, GL);
  assert.equal(t.refGiven, false);
  assert.equal(deriveTarget({ hostname: "reader.github.io", pathname: "/agent-m/", search: "?product=javascript:alert(1)" }).repo, "reader/agent-m");
  const fileOf = (address, ref, path) => connect(parseAddress(address)).webLinks().file(path, ref);
  assert.equal(fileOf(GL_ADDR, "main", "docs/use-cases/UC-001 a.md"), `${GL_ADDR}/-/blob/main/docs/use-cases/UC-001%20a.md`);
  assert.equal(fileOf("https://github.com/a/b", "main", "SPEC.md"), "https://github.com/a/b/blob/main/SPEC.md");
});
