// The explanations of a run and of its limits (ITM-980) — MOD-site-frame's explain, for the folded What is this? of UC-043: what a run is, and each of the three limits fixed at its start
// (step 4: "jobs at once ..., the cost limit (counted only from costs the runtimes report), and the correction rounds per draft (preset 5). A folded What is this? explains each"). The run page of
// MOD-implementation-pages shows them folded at their step; this file pins the topics.
// Run: node --test tests/site-frame-run-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; A RUN HAS LIMITS FIXED AT ITS START; UC-043
// Level: unit
//
// The document is the small DOM of tests/settings-pages-harness.mjs. What a test pins of a topic is each claim UC-043 makes of the step, stated in the test's own text, none read from a document when
// the test runs. The topic names are run, run-jobs-at-once, run-cost-limit and run-correction-rounds: no view names them yet, since the route `run` of MOD-implementation-pages is not built, and a
// view that names them later finds them held. The counter-proof (a topic left out of explanations.md and the test's failing result) is recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { installDocument } from "./settings-pages-harness.mjs";

installDocument();
const { explain } = await import("../src/site-frame/index.mjs");
const { renderArtifact } = await import("../src/markdown-render/index.mjs");

const EXPLANATIONS = readFileSync(new URL("../src/site-frame/explanations.md", import.meta.url), "utf8");
const topicText = (topic) => EXPLANATIONS.split(/^## /m).slice(1).find((part) => part.startsWith(`${topic}\n`))?.slice(topic.length + 1);
const bodyText = (topic) => (explain(topic).children[1]?.textContent ?? "").replace(/\s+/g, " ");
const TOPICS = ["run", "run-jobs-at-once", "run-cost-limit", "run-correction-rounds"];

function assertClaims(topic, claims) {
  assert.equal(Boolean(topicText(topic)?.trim()), true, `known positive: explanations.md holds the topic ${topic}`);
  const text = bodyText(topic);
  for (const [pattern, says] of claims) assert.match(text, pattern, `${topic}: it says ${says}`);
}

// TST-980001 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-043
// given: explanations.md, and the topics run, run-jobs-at-once, run-cost-limit and run-correction-rounds
// input: explain(topic) for each
// expect: each is the folded What is this? — a <details class="explain"> without the open attribute, holding <summary>What is this?</summary> and then the topic's Markdown rendered, in which no asterisk or backtick of the source is left standing
test("explain — each topic of a run and its limits is a folded What is this? with its text", () => {
  assert.match(renderArtifact("an *unclosed mark and `another").textContent, /[*`]/, "known positive: the renderer leaves a mark that is not closed standing");
  for (const topic of TOPICS) {
    const text = topicText(topic);
    assert.equal(Boolean(text?.trim()), true, `known positive: explanations.md holds the topic ${topic}`);
    const folded = explain(topic);
    assert.equal(folded.localName, "details", `${topic}: it is expandable`);
    assert.equal(folded.className, "explain", `${topic}: it uses the shared explanation presentation`);
    assert.equal(folded.hasAttribute("open"), false, `${topic}: it is folded`);
    const [summary, body, ...more] = folded.children;
    assert.deepEqual([summary.localName, summary.textContent, more.length], ["summary", "What is this?", 0], topic);
    assert.equal(body.innerHTML, renderArtifact(text).innerHTML, `${topic}: its body is its text, rendered`);
    assert.doesNotMatch(bodyText(topic), /[*`]/, `${topic}: it shows no stray Markdown`);
  }
});

// TST-980002 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-043
// given: the topic run
// input: explain("run")
// expect: text saying a run carries out the product's process model over what the person selects, that the selection is the steps of the implementation plan or, in Scrum or Kanban, backlog items, that Start run is one click, that the CI configuration is generated if the product has none, that the tests are written and at the end the validation of what was built is shown, that the person is asked only where the model gives a gate to a person or when a limit is reached, and that implementation, tests and CI can each be started on their own (UC-024, UC-026, UC-027)
test("explain — run: what a run is and when it asks (UC-043)", () => {
  assertClaims("run", [
    [/A run carries out the product's process model over what you select/, "a run carries out the process model over a selection"],
    [/steps of the implementation plan/, "the selection is steps of the implementation plan"],
    [/Scrum or Kanban, backlog items/, "in Scrum or Kanban the selection is backlog items"],
    [/Start run[^.]*one click/, "Start run is one click"],
    [/generates the CI configuration if the product has none/, "the CI configuration is generated if the product has none"],
    [/writes the tests/, "the tests are written"],
    [/at the end shows the validation of what was built/, "the validation is shown at the end"],
    [/asked only where the model gives a gate to a person, or when a limit is reached/, "the person is asked only at a gate of a person or at a limit"],
    [/each on its own[^.]*UC-024[^.]*UC-026[^.]*UC-027/, "implementation, tests and CI can each be started on their own"],
  ]);
});

// TST-980003 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; A RUN HAS LIMITS FIXED AT ITS START; UC-043
// given: the topic run-jobs-at-once
// input: explain("run-jobs-at-once")
// expect: text saying how many jobs the run may have running at the same time, that it is preset to the work-in-progress limit of the product's process model or to 3 where the model sets none, and that a job that waits for another job or for a gate does not start before it is done
test("explain — run-jobs-at-once: how many jobs run at the same time, preset to the model's limit or 3 (UC-043 4)", () => {
  assertClaims("run-jobs-at-once", [
    [/How many jobs the run may have running at the same time/, "what the limit counts"],
    [/preset to the work-in-progress limit of the product's process model, or to 3 where the model sets none/, "the preset: the model's work-in-progress limit, or 3"],
    [/job that waits for another job or for a gate does not start before it is done/, "a job that waits does not start before"],
  ]);
});

// TST-980004 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; A RUN HAS LIMITS FIXED AT ITS START; NO COST IS GUESSED; UC-043
// given: the topic run-cost-limit
// input: explain("run-cost-limit")
// expect: text saying the most the run may cost, that it is counted only from costs the runtimes report, that a job whose runtime reports none adds nothing to the count and shows its cost as unknown, that when the limit is reached the run starts no further job and lets the running ones finish, and that the person may raise the limit and press Continue, which starts the remaining jobs under the same run
test("explain — run-cost-limit: counted only from costs the runtimes report, and what happens at the limit (UC-043 4, 6c)", () => {
  assertClaims("run-cost-limit", [
    [/The most the run may cost/, "what the limit is"],
    [/counted only from costs the runtimes report/, "it is counted only from costs the runtimes report"],
    [/job whose runtime reports none adds nothing to the count and is shown with its cost unknown/, "a job without a reported cost adds nothing and shows it as unknown"],
    [/starts no further job, lets the running ones finish/, "at the limit no further job starts and the running ones finish"],
    [/raise the limit and press Continue, which starts the remaining jobs under the same run/, "raising the limit and Continue starts the remaining jobs under the same run"],
  ]);
});

// TST-980005 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; A RUN HAS LIMITS FIXED AT ITS START; THE CORRECTION LOOP HAS A FIXED LIMIT; UC-043
// given: the topic run-correction-rounds
// input: explain("run-correction-rounds")
// expect: text saying how many times a draft may go back to its participant to be corrected before it is shown with what is left, that it is preset to 5 per draft and applies to every job of the run that drafts, and that when the limit is reached the run starts no further job and lets the running ones finish
test("explain — run-correction-rounds: how often a draft is corrected, preset to 5 per draft (UC-043 4, 6c)", () => {
  assertClaims("run-correction-rounds", [
    [/How many times a draft may go back to its participant to be corrected before it is shown to you with what is left/, "what the limit counts"],
    [/preset to 5 per draft/, "the preset is 5 per draft"],
    [/applies to every job of the run that drafts/, "it applies to every job that drafts"],
    [/starts no further job, lets the running ones finish/, "at the limit no further job starts and the running ones finish"],
  ]);
});

// TST-980006 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF
// given: explanations.md, and the topics run-panel and correction-loop as they stood before ITM-980
// input: the SHA-256 of each topic's Markdown
// expect: each equals the digest of the text as it stood: the new topics change neither of the two they sit beside
test("explanations.md — the run panel's and the correction loop's topics stand unchanged beside the run's", () => {
  const stood = {
    "run-panel": "5871fccdd924419827f60e3aac27a3655114186ee56a2b263c30d70398b5a6ff",
    "correction-loop": "8840a21f747d735567a568fa55180101a0a775285c16ffa189fd99b99c9bc6d4",
  };
  for (const [topic, digest] of Object.entries(stood)) {
    const text = topicText(topic);
    assert.equal(Boolean(text?.trim()), true, `known positive: explanations.md holds the topic ${topic}`);
    assert.equal(createHash("sha256").update(text).digest("hex"), digest, `${topic}: its text is unchanged`);
  }
});
