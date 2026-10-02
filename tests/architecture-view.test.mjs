// The dashboard's Architecture view — its tab, the blocked panel, and the core's functions it calls. Deterministic, no
// network. Run: node --test tests/*.test.mjs
//
// Module: MOD-dashboard-app
// Guards: ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; ONE REVIEW LAYOUT FOR EVERY PRODUCT; UC-022
// Level: component
//
// SPEC §11 ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; §10 ONE REVIEW LAYOUT FOR EVERY PRODUCT (UC-022 step 8, 10, 10a). Moved out
// of tests/architecture.test.mjs, unchanged, when it was split by module. Counter-proofs are listed in
// docs/measurements/2026-09-30_review-dashboard-mutations.md §8.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { ARCHITECTURE_FILE } from "../docs/assets/artifacts.mjs";
import { prerequisitesHtml } from "../docs/assets/dashboard/review-views.mjs";
import { repoServer, openDashboard } from "./app-harness.mjs";

// The dashboard's own files (MOD-dashboard-app): the shell, docs/assets/dashboard-app.mjs, and every view and settings section
// under docs/assets/dashboard/ — what a test that read the one app file reads now.
const dashboardText = () => {
  const assets = new URL("../docs/assets/", import.meta.url);
  const views = readdirSync(new URL("dashboard/", assets), { recursive: true }).filter((f) => f.endsWith(".mjs")).sort();
  return ["dashboard-app.mjs", ...views.map((f) => `dashboard/${f}`)].map((f) => readFileSync(new URL(f, assets), "utf8")).join("\n");
};

const ARC = "docs/architecture/ARC-001-static-client.md", READER = "docs/architecture/MOD-reader.md";
const REVIEW = "docs/architecture/MOD-review.md", PAGE = "docs/architecture/MOD-page.md";
const UC1 = "docs/use-cases/UC-001-read-a-file.md", UC2 = "docs/use-cases/UC-002-show-the-status.md";
const archPaths = [ARC, READER, REVIEW, PAGE];

// ---------------------------------------------------------------- ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS

test("ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — the blocked panel: Accept disabled, every open item named, explained", () => {
  const html = prerequisitesHtml([{ name: "UC-001", reason: "not accepted yet" }, { name: "OLD RULE", reason: "withdrawn in SPEC.md" }]);
  assert.match(html, /<button[^>]*disabled[^>]*>Accept<\/button>/);
  assert.match(html, /UC-001/);
  assert.match(html, /OLD RULE/);
  assert.match(html, /withdrawn in SPEC\.md/);
  assert.match(html, /<details class="explain"><summary>What is this\?<\/summary>/);
  assert.doesNotMatch(html, /data-accept-key|data-tick/, "nothing that could accept or tick");
  assert.equal(prerequisitesHtml([]), "", "nothing open, nothing blocked");
});

// ---------------------------------------------------------------- the app

test("the dashboard has an Architecture tab that lists, reviews, accepts and edits ARC and MOD files like use cases", async () => {
  // The tab bar is written by the dashboard from its table of views; the page's own tab bar is read.
  const html = (await openDashboard({ server: await repoServer({ files: { "SPEC.md": "# SPEC\n" } }) })).el("tabs");
  assert.match(html, /<a href="#arc" role="tab" id="tab-arc">Architecture<\/a>/);
  const app = dashboardText();
  assert.match(app, /paths\(ARCHITECTURE_FILE\)/, "the files are read by the core's pattern");
  assert.deepEqual(archPaths.concat(["docs/architecture/README.md", "docs/architecture/ARC-1-x.md", "docs/use-cases/UC-001-x.md",
    "docs/architecture/sub/MOD-x.md"]).filter((p) => ARCHITECTURE_FILE.test(p)), archPaths, "docs/architecture/ARC-<nnn>-<slug>.md and MOD-<slug>.md only");
  const view = app.match(/async function viewArchitectureFile\([\s\S]*?\n}\n/)[0];
  assert.match(app, /const prerequisitesOf = \(f\) => architecturePrerequisites\(/, "the gate is the core's");
  assert.ok(view.includes("prerequisitesOf(f)") && view.includes("prerequisitesHtml("), "the gate is part of the view");
  assert.ok(view.indexOf("prerequisitesHtml(") < view.indexOf("acceptPanel("), "while something is open, no accept panel");
  assert.ok(view.includes("accepted-diff"), "the difference to the last accepted text");
  assert.ok(view.includes("impact"), "the impact list beside it");
  assert.ok(view.includes("editPanel("), "the editor with preview");
  assert.ok(view.indexOf("accepted-diff") < view.indexOf('<article class="md doc">'), "the difference above the text");
  assert.match(app, /componentDiagram\(/);
  assert.match(app, /saveReviewedFile\(/);
  assert.doesNotMatch(app, /function (impactList|architectureImpact|linkGraph|componentDiagram|parseArchitecture)\(/, "one implementation, in the core");
});
