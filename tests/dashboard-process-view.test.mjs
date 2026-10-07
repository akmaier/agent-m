// A change between jobs, sprint 06 (SPEC.md WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS): docs/assets/dashboard/
// process-view.mjs makes the dashboard's old routing call MOD-implementation-pages' route `process` (ITM-222) in place
// of showing the use-case list for an address no view answers — this test checks that the dashboard now reaches the
// page "How this product is developed". The route itself — its models, roles, findings and Save — is tested by
// tests/implementation-pages.test.mjs and is not repeated here.
//
// Module: MOD-dashboard-app
// Guards: UC-002
// Guards: WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS
// Level: component

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard } from "./app-harness.mjs";

// docs/process.md, declaring the shipped waterfall model (src/model-catalogue/models/waterfall.md) with no role
// assignment yet — enough for the route to render; its own declaration behaviour is tests/implementation-pages.test.mjs's.
const PROCESS_MD = `---
model: waterfall
model_file: src/model-catalogue/models/waterfall.md
model_version: ${"c0ffee".padEnd(40, "0")}
---
# How this product is developed

## Roles

| Role | Participants |
|---|---|

## Practices

- none

## Branches

| Phase or time box | Branch |
|---|---|

## Definition of Done

The job rules hold; no condition is added.
`;

// given: a repository holding docs/process.md, shown as both the instance and the product — no ?product=/?repo= is
//        given, so the dashboard shows itself (dashboard-app.mjs deriveTarget/start)
// input: openDashboard({ server, hash: "#process" })
// expect: the page shows the route's own title, "How this product is developed"
test("opening #process shows the page MOD-implementation-pages' route builds, titled \"How this product is developed\"", async () => {
  const server = await repoServer({ files: { "docs/process.md": PROCESS_MD } });
  const page = await openDashboard({ server, hash: "#process" });
  assert.match(page.main(), /How this product is developed/);
});
