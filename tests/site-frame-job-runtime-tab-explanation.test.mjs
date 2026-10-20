// The explanation of a tab job (ITM-1078) — MOD-site-frame's explain, for the folded What is this? of a job that runs in the browser tab (UC-036 1b): "Its record is listed, with the note that its live state and log exist
// only in that tab; the folded explanation recommends a CI or bridge route for long jobs."
// Run: node --test tests/site-frame-job-runtime-tab-explanation.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; ONE DASHBOARD SHOWS EVERY JOB; UC-036
// Level: unit
//
// It imports the module's browser harness, tests/site-frame-dom.mjs, unchanged, as the other explanation tests do. The topic is `job-runtime-tab` of src/site-frame/explanations.md (MOD-site-frame.md:111: the file's
// section `## <topic>`, its body the Markdown shown when unfolded). Readings the texts leave open, which the tests state (the pull request names them):
//   - The record is "kept" when the text says the record stays in the product's repository; the live state and log exist "only in the tab" when the text says so of both; a long job is recommended to "CI" and to "a Bridge" by name.
//   - The text claims no record is missing: the sentence "leaves no record in the repository" is false of the record MOD-runtimes' queueJob writes (MOD-job-ledger.md:91).
// The counter-proofs are recorded in the pull request.

import "./site-frame-dom.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import { explain } from "../src/site-frame/index.mjs";
import { topicFindings, topicsHeld, topicsNamed } from "./site-frame-topics.mjs";

const EXPLANATIONS = readFileSync(new URL("../src/site-frame/explanations.md", import.meta.url), "utf8");
const topicText = (topic) => EXPLANATIONS.split(/^## /m).slice(1).find((part) => part.startsWith(`${topic}\n`))?.slice(topic.length + 1);
const bodyText = (topic) => (explain(topic).children[1]?.textContent ?? "").replace(/\s+/g, " ");

// TST-1078001 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; ONE DASHBOARD SHOWS EVERY JOB; UC-036 (1b)
// given: the topic job-runtime-tab of explanations.md
// input: the topic unfolded
// expect: it says that a tab job's record is kept in the product's repository, that its live state and log exist only in the tab that runs it, and that a long job is better started on CI or on a Bridge
test("job-runtime-tab says the record is kept, the live state and log are the tab's, and recommends CI or a Bridge for long jobs", () => {
  assert.ok(topicText("job-runtime-tab")?.trim(), "known positive: explanations.md holds the topic");
  const text = bodyText("job-runtime-tab");
  assert.match(text, /record is kept in the product'?s? repository/i, "the record is kept");
  assert.match(text, /live state and log exist only in the tab/i, "live state and log exist only in the tab");
  assert.match(text, /long job.*\bCI\b.*\bBridge\b|long job.*\bBridge\b.*\bCI\b/i, "a long job is recommended to CI or a Bridge");
});

// TST-1078002 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-036 (1b)
// given: the topic job-runtime-tab
// input: the topic unfolded
// expect: it does not say that a tab job "leaves no record in the repository"
test("job-runtime-tab does not say that a tab job leaves no record", () => {
  assert.doesNotMatch(bodyText("job-runtime-tab"), /leaves no record in the repository/i);
});

// TST-1078003 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF
// given: explanations.md and the text of src/main-page/jobs.mjs, which names the topic job-runtime-tab
// input: the frame's own check of the topics over that file
// expect: the file names the topic (known positive), the topic is held, and the check finds nothing
test("the frame's check of topics finds job-runtime-tab named by the job page and held", () => {
  const page = readFileSync(new URL("../src/main-page/jobs.mjs", import.meta.url), "utf8");
  assert.ok(topicsNamed(page).includes("job-runtime-tab"), "known positive: the job page names the topic");
  assert.ok(topicsHeld(EXPLANATIONS).has("job-runtime-tab"), "known positive: the file holds the topic");
  assert.deepEqual(topicFindings([{ path: "src/main-page/jobs.mjs", text: page }], EXPLANATIONS), []);
});
