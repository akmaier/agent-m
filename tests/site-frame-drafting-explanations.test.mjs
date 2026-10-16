// The explanations of drafting use cases and of changing one by prompt (ITM-348) — MOD-site-frame's explain, for the steps of UC-007
// and UC-019 that ask something of the person: the requirements to cover; the participant and where it processes data; the run panel
// and what is sent; the correction loop, its findings and rounds; drafted use cases, written open; the instruction and its examples;
// the difference against the current text; Save, which writes a use case open; a CI agent's draft. The drafting and prompt pages
// (ITM-362, ITM-363) show them folded.
// Run: node --test tests/site-frame-drafting-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; UC-007; UC-019
// Level: unit
//
// This imports the module's existing browser harness unchanged, as tests/site-frame-review-explanations.test.mjs does, then exercises the
// public explain interface; the topics are this file's only subject. The eight topics are those the item's Outcome lists, each under a
// slug of its own that the pages will name. What a test pins of a topic is what UC-007, UC-019 and UC-008 say of the step — each claim a
// sentence of the topic makes — and nothing a topic merely happens to word. The topics point to no chapter of the book: none is claimed
// for them. Each test states its input and its expected result before it runs (given / input / expect); where a test asserts that
// something is absent, the same check is first shown to find it on a known positive. The counter-proofs are recorded in the pull request.

import "./site-frame.test.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderArtifact } from "../src/markdown-render/index.mjs";
import { explain } from "../src/site-frame/index.mjs";

const EXPLANATIONS = readFileSync(new URL("../src/site-frame/explanations.md", import.meta.url), "utf8");
// The Markdown under `## <topic>`, up to the next such line; undefined where the file holds no such line.
const topicText = (topic) => EXPLANATIONS.split(/^## /m).slice(1).find((part) => part.startsWith(`${topic}\n`))
  ?.slice(topic.length + 1);
// The folded body's rendered text, as a person reads it: runs of whitespace collapsed to one space.
const bodyText = (topic) => (explain(topic).children[1]?.textContent ?? "").replace(/\s+/g, " ");

const TOPICS = ["requirements-to-cover", "drafting-participant", "run-panel", "correction-loop", "drafted-use-cases",
  "draft-difference", "save-use-case", "ci-agent-draft"];

// The claims a topic's rendered text must make: each a pattern and what it says.
function assertClaims(topic, claims) {
  assert.ok(topicText(topic)?.trim(), `known positive: explanations.md holds the topic ${topic}`);
  const text = bodyText(topic);
  for (const [pattern, says] of claims) assert.match(text, pattern, `${topic}: it says ${says}`);
}

// TST-472806 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-007; UC-019
// given: explanations.md, and the eight topics of drafting and changing by prompt
// input: explain(topic) for each
// expect: each is the folded What is this? — a <details class="explain"> without the open attribute, holding <summary>What is this?</summary> and then the topic's Markdown rendered, in which no asterisk or backtick of the source is left standing
test("explain — each topic of drafting and changing by prompt is a folded What is this? with its text", () => {
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

// TST-472807 · level: unit · module: MOD-site-frame
// guards: UC-007 (step 1)
// given: the topic requirements-to-cover
// input: explain("requirements-to-cover")
// expect: text saying the requirements to cover are those the drafted use cases should realise, by default all that no use case realises yet, and that the selection can be changed
test("explain — requirements-to-cover: what is covered by default and that the selection can change (UC-007)", () => {
  assertClaims("requirements-to-cover", [
    [/requirements the drafted use cases should realise/, "they are the requirements the drafted use cases should realise"],
    [/By default they are all the requirements that no use case realises yet/, "by default all that no use case realises yet"],
    [/you can change the selection/, "the selection can be changed"],
  ]);
});

// TST-472808 · level: unit · module: MOD-site-frame
// guards: A PARTICIPANT DECLARES WHERE IT PROCESSES DATA; A PARTICIPANT DECLARES ITS CAPABILITIES; UC-007 (step 2); UC-019 (step 3)
// given: the topic drafting-participant
// input: explain("drafting-participant")
// expect: text saying the participant writes the draft; that only participants of the instance's list declared able to draft text are offered; that the place where each processes data is shown, since what is sent goes there; and that nothing is sent before Run
test("explain — drafting-participant: who drafts and where it processes data (UC-007, UC-019)", () => {
  assertClaims("drafting-participant", [
    [/model or agent that writes the draft/, "the participant writes the draft"],
    [/only participants from this instance's list/, "only participants of the instance's list are offered"],
    [/declared able to draft text/, "and only those declared able to draft text"],
    [/where it processes data/, "the place where each processes data is shown"],
    [/whatever is sent goes to that place/, "because what is sent goes there"],
    [/nothing is sent until you press Run/, "nothing is sent before Run"],
  ]);
});

// TST-472809 · level: unit · module: MOD-site-frame
// guards: THE PAGE NAMES WHERE IT SENDS; NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY; UC-007 (steps 2 and 3); UC-019 (steps 4, 4a and 5)
// given: the topic run-panel
// input: explain("run-panel")
// expect: text saying the panel comes before anything is sent; names every participant that will receive something, where it processes data and what it receives part by part with sizes against its context — requirements, every existing use case, a chapter of the book, the prompt —; that when the whole does not fit nothing is sent, the panel says how much there is and how much fits, and nothing is left out silently; and that Run is the one click that sends
test("explain — run-panel: what the panel before a run shows (UC-007, UC-019)", () => {
  assertClaims("run-panel", [
    [/before anything is sent/, "the panel comes before anything is sent"],
    [/names every participant that will receive something/, "it names every participant that will receive something"],
    [/where it processes data/, "and where it processes data"],
    [/exactly what it receives, part by part/, "and exactly what it receives, part by part"],
    [/size of each part against how much the participant's context can hold/, "with each part's size against the participant's context"],
    [/the requirements to cover, every existing use case, a chapter of the book/, "what is sent: the requirements, every existing use case, a chapter"],
    [/and the prompt/, "and the prompt"],
    [/does not fit, nothing is sent/, "when it does not fit nothing is sent"],
    [/how much there is and how much fits/, "the panel says how much there is and how much fits"],
    [/nothing is left out silently/, "nothing is left out silently"],
    [/Run is the one click that sends/, "Run is the one click that sends"],
  ]);
});

// TST-472810 · level: unit · module: MOD-site-frame
// guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; A FINDING READS LIKE A COMPILER MESSAGE; AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED; THE CORRECTION LOOP HAS A FIXED LIMIT; THE ROUNDS ARE COUNTED AND SHOWN; UC-007 (step 5); UC-019 (step 7)
// given: the topic correction-loop
// input: explain("correction-loop")
// expect: text saying the draft is checked without a model before the person sees it; every finding goes back to the participant as one line like a compiler message with file and line, error or warning, rule and correction; an error must be fixed, a warning fixed or kept with a one-line reason; the loop ends when the draft passes, at the limit shown on the run panel, or when a round changes nothing; the rounds are counted and shown with the draft, and findings left are shown beside it
test("explain — correction-loop: the findings, the rounds and when it stops (UC-007, UC-019)", () => {
  assertClaims("correction-loop", [
    [/Before you see a draft, Agent M checks it without a model/, "the draft is checked without a model before it is seen"],
    [/realised names that match real requirements/, "among the checks, realised names that match requirements"],
    [/sent back to the participant as one line, like a message from a compiler/, "every finding goes back as one line like a compiler message"],
    [/the file and line, whether it is an error or a warning, the rule and the correction expected/, "what such a line names"],
    [/An error must be fixed/, "an error must be fixed"],
    [/a warning is fixed or kept with a one-line reason/, "a warning is fixed or kept with a one-line reason"],
    [/until the draft passes/, "it ends when the draft passes"],
    [/the limit of rounds shown on the run panel/, "or at the limit shown on the run panel"],
    [/a round changes nothing/, "or when a round changes nothing"],
    [/rounds is counted and shown with the draft/, "the rounds are counted and shown with the draft"],
    [/finding left over is shown beside it/, "a finding left over is shown beside it"],
  ]);
});

// TST-472811 · level: unit · module: MOD-site-frame
// guards: A GENERATED ARTIFACT IS A PROPOSAL; A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN; UC-007 (step 6, postcondition); UC-008
// given: the topic drafted-use-cases
// input: explain("drafted-use-cases")
// expect: text saying a drafted use case is one file in docs/use-cases/ on the default branch, open — a proposal, not yet accepted —; that nothing relies on it until it is accepted; and that each is reviewed and accepted on its own, writing an approval record for exactly the text read
test("explain — drafted-use-cases: written open, accepted one by one (UC-007, UC-008)", () => {
  assertClaims("drafted-use-cases", [
    [/one file each in docs\/use-cases\//, "one file for each use case, in docs/use-cases/"],
    [/on the default branch/, "on the default branch"],
    [/each is open: a proposal, not yet accepted/, "each is open, a proposal, not yet accepted"],
    [/Nothing relies on a use case until you accept it/, "nothing relies on it until it is accepted"],
    [/accept each use case on its own/, "each is accepted on its own"],
    [/approval record for exactly the text you read/, "accepting writes an approval record for exactly the text read"],
  ]);
});

// TST-472812 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-019 (step 1: the examples of an instruction stand in the topic prompt-bar)
// given: explanations.md; known positive — the topic prompt-bar is held and explain("prompt-bar") has two children —; the topic change-instruction, which belonged to the removed prompt pages
// input: the topic's text in explanations.md, and explain("change-instruction")
// expect: the file holds no line `## change-instruction`; explain gives an element without any child
test("explain — change-instruction: the topic is gone, UC-019's examples stand in prompt-bar", () => {
  assert.ok(topicText("prompt-bar")?.trim(), "known positive: explanations.md holds the topic prompt-bar");
  assert.equal(explain("prompt-bar").children.length, 2, "known positive: a held topic gives a summary and a body");
  assert.equal(topicText("change-instruction"), undefined, "explanations.md holds no topic change-instruction");
  assert.equal(explain("change-instruction").childNodes.length, 0, "explain of it gives an element without any child");
});

// TST-472813 · level: unit · module: MOD-site-frame
// guards: A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT; UC-019 (steps 8 and 7b)
// given: the topic draft-difference
// input: explain("draft-difference")
// expect: text saying the draft is shown against the current text line by line, so that only what changed is read; that a name dropped from the realised requirements shows in it and is not an error; and that the draft can be edited or refined before saving
test("explain — draft-difference: the draft against the current text (UC-019)", () => {
  assertClaims("draft-difference", [
    [/against the current text, line by line/, "the draft is shown against the current text, line by line"],
    [/you read only what changed/, "so that only what changed is read"],
    [/dropped from the list of realised requirements/, "a dropped realised name shows up in it"],
    [/not an error/, "and is not an error"],
    [/edit the draft freely, or give a follow-up instruction to refine it/, "the draft can be edited or refined"],
  ]);
});

// TST-472814 · level: unit · module: MOD-site-frame
// guards: A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT; ONE CLICK PER DECISION; UC-019 (steps 9 and 9a)
// given: the topic save-use-case
// input: explain("save-use-case")
// expect: text saying Save is one click; that it commits a use case as open, not accepted; that the commit records the instruction, the participant, its model, the Agent M version, the date and the rounds; and that when the file changed meanwhile nothing is written and the draft stays beside the newer version
test("explain — save-use-case: Save writes a use case open (UC-019)", () => {
  assertClaims("save-use-case", [
    [/Save is one click/, "Save is one click"],
    [/commits the file to the default branch as open, not accepted/, "it commits the use case as open, not accepted"],
    [/records the instruction, the participant, its model, the Agent M version, the date/, "the commit records instruction, participant, model, version and date"],
    [/how many correction rounds/, "and how many correction rounds"],
    [/changed while the participant was drafting, nothing is written/, "when the file changed meanwhile nothing is written"],
    [/draft stays in the editor beside the newer version/, "the draft stays in the editor beside the newer version"],
  ]);
});

// TST-472815 · level: unit · module: MOD-site-frame
// guards: A CI AGENT'S DRAFT ENTERS AS OPEN; UC-019 (step 6b)
// given: the topic ci-agent-draft
// input: explain("ci-agent-draft")
// expect: text saying a CI agent runs in a GitHub Actions workflow, nobody waiting; that the workflow runs the same correction loop and commits the draft to the default branch, a use case as open and a change to requirements as an entry in a new queue, the SPEC untouched; that it is reviewed afterwards on the dashboard; and that nothing counts before it is accepted
test("explain — ci-agent-draft: what a CI agent's draft is and where it lands (UC-019)", () => {
  assertClaims("ci-agent-draft", [
    [/runs in a GitHub Actions workflow/, "a CI agent runs in a GitHub Actions workflow"],
    [/nobody is waiting at the dashboard/, "nobody is waiting at the dashboard"],
    [/same correction loop/, "the workflow runs the same correction loop"],
    [/a use case as open/, "a use case is committed as open"],
    [/entry in a new change queue/, "a change to requirements is an entry in a new change queue"],
    [/leaving the SPEC itself untouched/, "the SPEC stays untouched"],
    [/review it afterwards on the dashboard/, "it is reviewed afterwards on the dashboard"],
    [/Nothing counts before you accept it/, "nothing counts before it is accepted"],
  ]);
});
