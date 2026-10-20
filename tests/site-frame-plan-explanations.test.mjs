// The explanations of the implementation plan (ITM-1060) — MOD-site-frame's explain, for the folded What is this? of UC-045 (Plan the implementation): the plan with the table of UC-045 and the pointer to the
// book's chapter 6 (step 1), what the draft does (steps 2 and 3), what Save plan writes (step 5) and what a step's state is (step 1, the postcondition).
// Run: node --test tests/site-frame-plan-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; UC-045
// Level: unit
//
// It imports the module's browser harness, tests/site-frame-dom.mjs, unchanged, as the other explanation tests do. What a test pins of a topic is what UC-045 says of the step, claim by claim. Readings the texts leave
// open, which the tests state (the pull request names them):
//   - The route `plan` of MOD-implementation-pages is not built yet. The topics it names are the four above — `implementation-plan` (the plan, step 1), `plan-step-states` (the derived states of step 1),
//     `plan-draft` (steps 2 and 3) and `plan-save` (step 5) —; the frame's own check (tests/site-frame-topics.mjs) is run here over a page text that names them, as that page will.
//   - A topic's text is read as it renders (explain's body), with runs of whitespace collapsed; a claim is a sentence or phrase of UC-045 that the text must say.

import "./site-frame-dom.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import { renderArtifact } from "../src/markdown-render/index.mjs";
import { explain } from "../src/site-frame/index.mjs";
import { topicFindings, topicsHeld, topicsNamed } from "./site-frame-topics.mjs";

const EXPLANATIONS = readFileSync(new URL("../src/site-frame/explanations.md", import.meta.url), "utf8");
// The Markdown under `## <topic>`, up to the next such line; undefined where the file holds no such line.
const topicText = (topic) => EXPLANATIONS.split(/^## /m).slice(1).find((part) => part.startsWith(`${topic}\n`))
  ?.slice(topic.length + 1);
// The folded body's rendered text, as a person reads it: runs of whitespace collapsed to one space.
const bodyText = (topic) => (explain(topic).children[1]?.textContent ?? "").replace(/\s+/g, " ");

const TOPICS = ["implementation-plan", "plan-step-states", "plan-draft", "plan-save"];

function assertClaims(topic, claims) {
  assert.ok(topicText(topic)?.trim(), `known positive: explanations.md holds the topic ${topic}`);
  const text = bodyText(topic);
  for (const [pattern, says] of claims) assert.match(text, pattern, `${topic}: it says ${says}`);
}

// TST-1060001 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-045 (step 1)
// given: explanations.md, and the four topics of the plan
// input: explain(topic) for each
// expect: each is the folded What is this? — a <details class="explain"> without the open attribute, holding <summary>What is this?</summary> and then the topic's Markdown rendered, in which no asterisk or backtick of the source is left standing
test("explain — each topic of the plan is a folded What is this? with its text", () => {
  assert.match(renderArtifact("an *unclosed mark and `another").textContent, /[*`]/,
    "known positive: the renderer leaves a mark that is not closed standing");
  for (const topic of TOPICS) {
    const text = topicText(topic);
    assert.ok(text?.trim(), `known positive: explanations.md holds the topic ${topic}`);
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

// TST-1060002 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-045 (step 1, the table and the pointer to the book)
// given: the topic implementation-plan
// input: explain("implementation-plan")
// expect: text saying the plan integrates what the architecture decomposed (the V-model's idea of knowing how to check what is defined), the three rows of UC-045's table — a module (the module as its file describes it; unit tests), a subsystem (its modules as its decision describes their interplay; component tests), the system (the subsystems as the decision that states the system describes it; system tests and the release tests of the use cases, written by a participant other than the implementer) —, that a reuse-oriented model configures or adapts a module that adopts a library or a service, that in Scrum and Kanban the backlog takes the plan's place, and the pointer to chapter 6 of the book
test("explain — implementation-plan: the plan with the table of UC-045 and the pointer to chapter 6", () => {
  assertClaims("implementation-plan", [
    [/decides how the accepted architecture is assembled into software, before any of it is implemented/, "the plan decides how the architecture is assembled before implementation"],
    [/what the architecture decomposed, the plan integrates again/, "what the architecture decomposed, the plan integrates again"],
    [/whenever you define something on the way down, you should already know how you will check it on the way back up/, "the V-model's idea"],
    [/A step for/, "the table's first column"],
    [/a module\s*the module, as its file describes it\s*unit tests/, "the module row"],
    [/a subsystem\s*the subsystem's modules, as its decision describes their interplay\s*component tests/, "the subsystem row"],
    [/the system\s*the subsystems, as the decision that states the system describes it\s*system tests, and the release tests of the use cases, written by a participant other than the implementer/, "the system row"],
    [/configured or adapted in its step rather than developed/, "a reuse-oriented model configures or adapts"],
    [/In Scrum and Kanban the backlog takes this place/, "Scrum and Kanban have the backlog instead"],
    [/In the book Vibe Coding: chapter 6\./, "the pointer to chapter 6"],
  ]);
});

// TST-1060003 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-045 (step 1 and the postcondition)
// given: the topic plan-step-states
// input: explain("plan-step-states")
// expect: text naming the four states — waiting for a step it depends on, ready, in progress, done — and saying that no state is stored in the plan: each is derived from the job records and the pull requests
test("explain — plan-step-states: the four derived states of a step", () => {
  assertClaims("plan-step-states", [
    [/waiting for a step it depends on/, "waiting is for a step it depends on"],
    [/ready/, "ready"],
    [/in progress/, "in progress"],
    [/done/, "done"],
    [/No state is stored in the plan/, "no state is stored in the plan"],
    [/derived from the job records and the pull requests/, "the state is derived from the job records and the pull requests"],
  ]);
});

// TST-1060004 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-045 (steps 2 and 3)
// given: the topic plan-draft
// input: explain("plan-draft")
// expect: text saying the run panel names the drafting participant, where it processes data and what is sent, and that the click on Run is the decision; the draft is made from the bottom up — a step for each module, after every module whose interface it uses, then each subsystem's integration, then the system, each step with its phase of the model —; Agent M checks the complete draft, and a module, subsystem or system without a step, a module ordered before one whose interface it uses, or a step without the tests of its level goes back to the participant as a finding
test("explain — plan-draft: the bottom-up draft and the check that sends findings back", () => {
  assertClaims("plan-draft", [
    [/run panel names the drafting participant, where it processes data and what is sent/, "the run panel names the participant, the place and what is sent"],
    [/click on Run is the decision/, "the click on Run is the decision"],
    [/from the bottom up/, "the draft is made from the bottom up"],
    [/one step for each module, a module after every module whose interface it uses/, "a step for each module, ordered after the modules it uses"],
    [/then one step for each subsystem's integration/, "then each subsystem's integration"],
    [/then one step for the system/, "then the system"],
    [/the phase of the model it belongs to/, "each step names its phase"],
    [/checks the complete draft/, "Agent M checks the complete draft"],
    [/without a step/, "a module, subsystem or system without a step is a finding"],
    [/ordered before one whose interface it uses/, "a module ordered before one it uses is a finding"],
    [/without the tests of its level/, "a step without the tests of its level is a finding"],
    [/goes back to the participant as a finding/, "a finding goes back to the participant"],
  ]);
});

// TST-1060005 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-045 (step 5)
// given: the topic plan-save
// input: explain("plan-save")
// expect: text saying Save plan is one click; it commits one Markdown file for each step under docs/plan/, each an item ITM-<nnn>-<slug>.md naming what it implements or integrates and the tests of its level, and the order of the steps in docs/plan/order.md; from then on implementation jobs start only for steps of the plan; nothing is written before the click
test("explain — plan-save: what Save plan writes and what follows", () => {
  assertClaims("plan-save", [
    [/Save plan is one click/, "Save plan is one click"],
    [/one Markdown file for each step under docs\/plan\//, "one file for each step under docs/plan/"],
    [/ITM-<nnn>-<slug>\.md/, "each file is ITM-<nnn>-<slug>.md"],
    [/what it implements or integrates and the tests of its level/, "each file names what it implements or integrates and its tests"],
    [/order of the steps in docs\/plan\/order\.md/, "the order is in docs/plan/order.md"],
    [/implementation jobs start only for steps of the plan/, "implementation jobs start only for steps of the plan"],
    [/Nothing is written before the click/, "nothing is written before the click"],
  ]);
});

// TST-1060006 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF
// given: a text of the plan page that names the four topics, each as explain("<topic>"); the file explanations.md as it stands; and the same file with the topic plan-save left out
// input: topicsNamed of the page text; the frame's own check, topicFindings, against each file
// expect: the page names the four topics; against the file as it stands the check finds none missing; known positive: the file as it stands holds the four; counter-proof: against the file without plan-save the check finds exactly plan-save, with the path of the page
test("the frame's own check — finds none of the plan's topics missing, and finds a topic left out", () => {
  const PAGE = TOPICS.map((topic) => `target.append(explain("${topic}"));`).join("\n");
  assert.deepEqual(topicsNamed(PAGE), TOPICS);
  assert.deepEqual(TOPICS.filter((topic) => topicsHeld(EXPLANATIONS).has(topic)), TOPICS, "known positive: the file holds the four topics");
  assert.deepEqual(topicFindings([{ path: "src/implementation-pages/plan.mjs", text: PAGE }], EXPLANATIONS), []);
  const without = EXPLANATIONS.split(/^(?=## )/m).filter((part) => !part.startsWith("## plan-save\n")).join("");
  const findings = topicFindings([{ path: "src/implementation-pages/plan.mjs", text: PAGE }], without);
  assert.equal(findings.length, 1);
  assert.match(JSON.stringify(findings), /plan-save/);
  assert.match(JSON.stringify(findings), /src\/implementation-pages\/plan\.mjs/);
});
