// The explanations of closing a sprint (ITM-988) — MOD-site-frame's explain, for the folded What is this? of UC-041: the increment (step 2: "a folded What is this? says that an item that does not meet the
// Definition of Done is not part of it, however close it is"), the feedback lines (step 3), the unfinished items (step 4) and the retrospective (step 5). The close page of MOD-implementation-pages
// shows them folded at their step; this file pins the topics.
// Run: node --test tests/site-frame-close-sprint-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT; A SPRINT ENDS WITH A RETROSPECTIVE; AN AGENT'S REVIEW NAMES WHERE ITS FEEDBACK CAME FROM; AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF; UC-041
// Level: unit
//
// The document is the small DOM of tests/settings-pages-harness.mjs. What a test pins of a topic is each claim UC-041 makes of the step, stated in the test's own text, none read from a document when the test
// runs. The topic names are sprint-increment, sprint-feedback, sprint-unfinished-items and sprint-retrospective: no view names them yet, since the route `sprint/<team>/<n>/close` of MOD-implementation-pages is
// not built, and a view that names them later finds them held. The counter-proof (a topic left out of explanations.md and the test's failing result) is recorded in the pull request.

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
const TOPICS = ["sprint-increment", "sprint-feedback", "sprint-unfinished-items", "sprint-retrospective"];

function assertClaims(topic, claims) {
  assert.equal(Boolean(topicText(topic)?.trim()), true, `known positive: explanations.md holds the topic ${topic}`);
  const text = bodyText(topic);
  for (const [pattern, says] of claims) assert.match(text, pattern, `${topic}: it says ${says}`);
}

// TST-988001 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-041
// given: explanations.md, and the topics sprint-increment, sprint-feedback, sprint-unfinished-items and sprint-retrospective
// input: explain(topic) for each
// expect: each is the folded What is this? — a <details class="explain"> without the open attribute, holding <summary>What is this?</summary> and then the topic's Markdown rendered, in which no asterisk or backtick of the source is left standing
test("explain — each topic of closing a sprint is a folded What is this? with its text", () => {
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

// TST-988002 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT; UC-041
// given: the topic sprint-increment
// input: explain("sprint-increment")
// expect: text saying the increment is the set of done items, that an item is done when it is merged and its Definition of Done is met and is shown with its pull request, the requirements it realises and the tests that guard them, that an item that does not meet the Definition of Done is not part of the increment, however close it is, that it is shown among the items not done with its state and the reason, and that with no item done the increment is empty and the review says so
test("explain — sprint-increment: an item that does not meet the Definition of Done is not part of it, however close it is (UC-041 2)", () => {
  assertClaims("sprint-increment", [
    [/The increment is the set of done items/, "the increment is the set of done items"],
    [/done when it is merged and its Definition of Done is met/, "an item is done when merged with its Definition of Done met"],
    [/pull request, the requirements it realises and the tests that guard them/, "a done item is shown with its pull request, requirements and tests"],
    [/An item that does not meet the Definition of Done is not part of the increment, however close it is/, "an item that does not meet the Definition of Done is not part of it, however close it is"],
    [/items not done, with its state and the reason/, "it is shown among the items not done with its state and reason"],
    [/no item is done, the increment is empty and the review says so/, "with no item done the increment is empty and the review says so"],
  ]);
});

// TST-988003 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; AN AGENT'S REVIEW NAMES WHERE ITS FEEDBACK CAME FROM; UC-041
// given: the topic sprint-feedback
// input: explain("sprint-feedback")
// expect: text saying feedback is entered as one line per point, each either new backlog item, change to an existing item, or noted, that a new backlog item and a change are written to the backlog when the sprint is closed, that the review says when no stakeholder took part, and that an agent's review names where its feedback came from
test("explain — sprint-feedback: one line per point, and what each kind becomes (UC-041 3)", () => {
  assertClaims("sprint-feedback", [
    [/one line per point/, "one line per point"],
    [/either new backlog item, change to an existing item, or noted/, "each line is a new backlog item, a change to an existing item, or noted"],
    [/new backlog item and a change to an existing one are written to the backlog when you close the sprint/, "a new item and a change are written to the backlog when the sprint is closed"],
    [/no stakeholder took part, the review says so/, "the review says when no stakeholder took part"],
    [/review by an agent names where its feedback came from/, "an agent's review names where its feedback came from"],
  ]);
});

// TST-988004 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH; UC-041
// given: the topic sprint-unfinished-items
// input: explain("sprint-unfinished-items")
// expect: text saying an unfinished item is a selected item that is not done, that for each the Product Owner chooses back to the backlog or into the next sprint, that an item that goes back to the backlog is no longer held by the sprint, and that the done items stay held until the sprint's increment is merged into the default branch
test("explain — sprint-unfinished-items: back to the backlog or into the next sprint, and what stays held (UC-041 4, 6)", () => {
  assertClaims("sprint-unfinished-items", [
    [/unfinished item is a selected item that is not done/, "an unfinished item is a selected item that is not done"],
    [/chooses back to the backlog or into the next sprint/, "for each the choice is back to the backlog or into the next sprint"],
    [/goes back to the backlog is no longer held by the sprint/, "an item back in the backlog is no longer held by the sprint"],
    [/done items stay held until the sprint's increment is merged into the default branch/, "the done items stay held until the increment is merged into the default branch"],
  ]);
});

// TST-988005 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; A SPRINT ENDS WITH A RETROSPECTIVE; AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF; UC-041
// given: the topic sprint-retrospective
// input: explain("sprint-retrospective")
// expect: text saying the team writes what went well, what did not and what it will change; that each change names where it goes — the process model (UC-031), the product's Definition of Done (UC-002), a participant's instructions or configuration (UC-017), or team agreement only; that the numbers of the sprint are offered as material, derived and not typed: jobs failed or retried, time items waited for a person, flaky tests, and cost where it is known; that Close sprint stays disabled until the retrospective has at least one entry; and that a change an agent's retrospective recommends is proposed for a person to accept and not applied by the agent
test("explain — sprint-retrospective: what is written, where a change goes, and the sprint's numbers (UC-041 5)", () => {
  assertClaims("sprint-retrospective", [
    [/what went well, what did not, and what it will change/, "what went well, what did not, and what it will change"],
    [/names where it goes: the process model[^.]*UC-031[^.]*Definition of Done[^.]*UC-002[^.]*participant's instructions or configuration[^.]*UC-017[^.]*team agreement only/, "where each change goes"],
    [/numbers of the sprint as material, derived and not typed/, "the sprint's numbers are offered as material, derived and not typed"],
    [/jobs failed or retried, time items waited for a person, flaky tests, and cost where it is known/, "which numbers"],
    [/Close sprint stays disabled until the retrospective has at least one entry/, "Close sprint stays disabled until there is one entry"],
    [/recommends is proposed for a person to accept and not applied by the agent/, "an agent's recommended change is proposed, not applied"],
  ]);
});

// TST-988006 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF
// given: explanations.md, and the topics definition-of-done and branch-of-its-own as they stood before ITM-988
// input: the SHA-256 of each topic's Markdown
// expect: each equals the digest of the text as it stood: the new topics change neither of the two they sit beside
test("explanations.md — the Definition of Done's and the branch's topics stand unchanged beside the sprint's", () => {
  const stood = {
    "definition-of-done": "1f57b56806cd9b8071e208c64fd276815305563b40013b6bbed5f94f81c89040",
    "branch-of-its-own": "dce16c00675cb173fd50b2240fbb63742bc15e768d4c6f54304863515394aafa",
  };
  for (const [topic, digest] of Object.entries(stood)) {
    const text = topicText(topic);
    assert.equal(Boolean(text?.trim()), true, `known positive: explanations.md holds the topic ${topic}`);
    assert.equal(createHash("sha256").update(text).digest("hex"), digest, `${topic}: its text is unchanged`);
  }
});
