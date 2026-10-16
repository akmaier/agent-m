// The explanations of deriving requirements from a source (ITM-346) — MOD-site-frame's explain, for the steps of UC-005 that ask something of the
// person: the linked version and its hash; the existing requirements sent with the excerpt; the run panel; the four classes of a candidate; the
// correction rounds; a conflict and a normative source; the queue that Write proposals writes. The derivation page (ITM-361) shows them folded.
// Run: node --test tests/site-frame-derivation-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; UC-005
// Level: unit
//
// This imports the module's existing browser harness unchanged, as tests/site-frame-drafting-explanations.test.mjs does, then exercises the public
// explain interface; the topics are this file's only subject. The seven topics are those the item's Outcome lists, each under a slug of its own that
// the page will name; the drafting topics `run-panel` and `correction-loop` speak of use cases and are left as they are. What a test pins of a topic is
// what UC-005 says of the step — each claim a sentence of the topic makes — and nothing a topic merely happens to word. The topics point to no chapter
// of the book as their source; `existing-requirements` names chapter 8 only because UC-005 step 2 says that chapter is sent. Each test states its
// input and its expected result before it runs (given / input / expect); where a test asserts that something is absent, the same check is first shown
// to find it on a known positive. The counter-proofs are recorded in the pull request.

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

const TOPICS = ["linked-version", "existing-requirements", "derivation-run-panel", "candidate-classes", "candidate-correction",
  "conflict-and-normative-source", "write-proposals"];

// The claims a topic's rendered text must make: each a pattern and what it says.
function assertClaims(topic, claims) {
  assert.ok(topicText(topic)?.trim(), `known positive: explanations.md holds the topic ${topic}`);
  const text = bodyText(topic);
  for (const [pattern, says] of claims) assert.match(text, pattern, `${topic}: it says ${says}`);
}

// TST-472798 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-005
// given: explanations.md, and the seven topics of deriving requirements
// input: explain(topic) for each
// expect: each is the folded What is this? — a <details class="explain"> without the open attribute, holding <summary>What is this?</summary> and then the topic's Markdown rendered, in which no asterisk or backtick of the source is left standing
test("explain — each topic of deriving requirements is a folded What is this? with its text", () => {
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

// TST-472799 · level: unit · module: MOD-site-frame
// guards: AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT; A REQUIREMENT HAS A REGISTERED SOURCE; UC-005 (step 1) and alternative 1a
// given: the topic linked-version
// input: explain("linked-version")
// expect: text saying Agent M reads exactly the version linked to the product; checks the file's hash, the SHA-256 against the one recorded when the version was registered; and that when it differs nothing is sent, and a new version must be registered
test("explain — linked-version: exactly the linked version is read and its hash checked (UC-005 step 1, 1a)", () => {
  assertClaims("linked-version", [
    [/reads exactly the version that is linked to the product/, "Agent M reads exactly the linked version"],
    [/checks the file's hash/, "it checks the file's hash"],
    [/the SHA-256, a fingerprint of its exact content/, "the hash is the SHA-256, a fingerprint of the exact content"],
    [/the one recorded when that version was registered/, "against the hash recorded when the version was registered"],
    [/If the hash differs, the content changed since it was registered/, "a different hash means the content changed since it was registered"],
    [/nothing is sent/, "then nothing is sent"],
    [/a new version of the source must be registered first/, "and a new version must be registered first"],
  ]);
});

// TST-472800 · level: unit · module: MOD-site-frame
// guards: DERIVATION SEES THE EXISTING REQUIREMENTS; NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY; UC-005 (steps 2 and 4) and alternative 2a
// given: the topic existing-requirements
// input: explain("existing-requirements")
// expect: text saying candidates are drafted against the existing requirements, not beside them; that Agent M collects every existing requirement, those of the SPEC and of the open change queues, and sends them with the excerpt and chapter 8 of the book; that when it does not fit nothing is sent, the count and what fits are told, a larger context or a smaller part offered, and no requirement is dropped silently
test("explain — existing-requirements: every existing requirement goes with the excerpt (UC-005 steps 2, 4, 2a)", () => {
  assertClaims("existing-requirements", [
    [/against the requirements the product already has, not beside them/, "candidates are drafted against the existing requirements, not beside them"],
    [/collects every existing requirement of the product/, "Agent M collects every existing requirement of the product"],
    [/those in its SPEC and those in its open change queues/, "those of the SPEC and of the open change queues"],
    [/sends them with the excerpt of the source/, "and sends them with the excerpt"],
    [/chapter 8 of the book Vibe Coding/, "with chapter 8 of the book Vibe Coding"],
    [/do not fit into its context, nothing is sent/, "if it does not fit into the context, nothing is sent"],
    [/says how many requirements there are and how much fits/, "Agent M says how many requirements there are and how much fits"],
    [/a participant with a larger context or a smaller part of the source/, "a larger context or a smaller part of the source is offered"],
    [/No requirement is dropped silently/, "no requirement is dropped silently"],
  ]);
});

// TST-472801 · level: unit · module: MOD-site-frame
// guards: THE PAGE NAMES WHERE IT SENDS; ONE CLICK PER DECISION; UC-005 (step 3) and alternative 3a
// given: the topic derivation-run-panel
// input: explain("derivation-run-panel")
// expect: text saying the panel comes before anything is sent; names the destination and where it processes data; says exactly what is sent — the excerpt and the existing requirements, with the chapter — and how many requirements are included; states the limit of correction rounds; and that Run is the one click that sends, nothing being sent without it
test("explain — derivation-run-panel: what the panel before a derivation shows (UC-005 step 3, 3a)", () => {
  assertClaims("derivation-run-panel", [
    [/appears before anything is sent/, "the panel comes before anything is sent"],
    [/names the destination/, "it names the destination"],
    [/where it processes data/, "and where it processes data"],
    [/exactly what is sent: the excerpt of the source and the existing requirements, with the chapter of the book/, "exactly what is sent: the excerpt, the existing requirements, the chapter"],
    [/how many requirements are included/, "how many requirements are included"],
    [/the limit of correction rounds/, "the limit of correction rounds"],
    [/Run is the one click that sends/, "Run is the one click that sends"],
    [/if you do not press it, nothing is sent/, "without it nothing is sent"],
  ]);
});

// TST-472802 · level: unit · module: MOD-site-frame
// guards: A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT; EXACT DUPLICATES ARE FOUND WITHOUT A MODEL; THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED; UC-005 (steps 5 and 6.2 and 7)
// given: the topic candidate-classes
// input: explain("candidate-classes")
// expect: text defining the four classes — new: nothing existing covers it; change: it alters a named existing requirement; duplicate: it restates one; conflict: it contradicts one —; saying an exact match of name or normalised rule is a duplicate without a model, whatever the model said; that the panel groups candidates by class beside the requirement each refers to; and that a candidate can be moved to another class
test("explain — candidate-classes: the four classes of a candidate (UC-005 steps 5, 6, 7)", () => {
  assertClaims("candidate-classes", [
    [/New: nothing existing covers it/, "new means nothing existing covers it"],
    [/Change: it alters a named existing requirement/, "change means it alters a named existing requirement"],
    [/Duplicate: it restates a named existing requirement/, "duplicate means it restates a named existing requirement"],
    [/Conflict: it contradicts a named existing requirement/, "conflict means it contradicts a named existing requirement"],
    [/name or normalised rule equals an existing requirement's is classified as a duplicate by Agent M without a model, whatever the model said/,
      "an exact match of name or normalised rule is a duplicate, found without a model, whatever the model said"],
    [/groups the candidates by class, each beside the requirement it refers to/, "the panel groups candidates by class, each beside the requirement it refers to"],
    [/you can move a candidate to another class/, "a candidate can be moved to another class"],
  ]);
});

// TST-472803 · level: unit · module: MOD-site-frame
// guards: A REQUIREMENT HAS FOUR FIELDS; A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; A FINDING READS LIKE A COMPILER MESSAGE; AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED; WHAT A PERSON DECIDES IS NOT SENT BACK; THE CORRECTION LOOP HAS A FIXED LIMIT; THE ROUNDS ARE COUNTED AND SHOWN; UC-005 (step 6.3)
// given: the topic candidate-correction
// input: explain("candidate-correction")
// expect: text saying the checks need no model and the findings go back as one line each, like compiler messages; that a candidate without one of the four fields of a requirement — its name, its source, its rule or its check, as A REQUIREMENT HAS FOUR FIELDS gives them — is an error, and a rule with a conjunction a warning to split or justify; that the participant corrects up to the limit of rounds on the run panel; that conflicts are never sent back; and that what is left after the last round is shown flagged, with the rounds counted
test("explain — candidate-correction: findings sent back, the rounds and what is left (UC-005 step 6.3)", () => {
  assert.doesNotMatch(bodyText("candidate-correction"), /four fields or its check/, "the check is one of the four fields, not set apart from them");
  assertClaims("candidate-correction", [
    [/checks them without a model/, "the checks need no model"],
    [/one line each, like messages from a compiler/, "findings go back one line each, like compiler messages"],
    [/lacks one of the four fields of a requirement, its name, its source, its rule or its check, is an error and must be fixed/,
      "a candidate lacking one of the four fields of a requirement — its name, its source, its rule or its check — is an error"],
    [/rule that contains a conjunction is a warning: split it, or give a reason/, "a rule with a conjunction is a warning: split it or give a reason"],
    [/corrects them, up to the limit of rounds the run panel states/, "the participant corrects up to the limit of rounds the run panel states"],
    [/Conflicts are never sent back/, "conflicts are never sent back"],
    [/What is left after the last round is shown flagged/, "what is left after the last round is shown flagged"],
    [/rounds are counted and shown/, "the rounds are counted and shown"],
  ]);
});

// TST-472804 · level: unit · module: MOD-site-frame
// guards: A CONFLICT IS DECIDED BY A PERSON; UC-005 (steps 6, 7 and 8) and alternative 7a
// given: the topic conflict-and-normative-source
// input: explain("conflict-and-normative-source")
// expect: text saying a conflict contradicts a named existing requirement; a person decides each, it is not sent back; that when it involves a normative source the panel says which side is normative, yet a normative source does not win automatically, because the product may be out of its scope; and that an undecided conflict stays in the panel and is not written
test("explain — conflict-and-normative-source: a person decides, a normative source does not win (UC-005 step 7, 7a)", () => {
  assertClaims("conflict-and-normative-source", [
    [/A conflict is a candidate that contradicts a named existing requirement/, "a conflict contradicts a named existing requirement"],
    [/you decide how each is resolved/, "a person decides how each is resolved"],
    [/the panel says which side is normative/, "when a normative source is involved the panel says which side is normative"],
    [/a normative source does not win automatically/, "a normative source does not win automatically"],
    [/the product may be out of that source's scope/, "because the product may be out of that source's scope"],
    [/stays in the panel and is not written/, "an undecided conflict stays in the panel and is not written"],
  ]);
});

// TST-472805 · level: unit · module: MOD-site-frame
// guards: A GENERATED ARTIFACT IS A PROPOSAL; A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN; A CHANGE IS PROPOSED UNDER THE EXISTING NAME; A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT; NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT; UC-005 (step 8)
// given: the topic write-proposals
// input: explain("write-proposals")
// expect: text saying Write proposals is one click that writes a new queue under docs/spec-freigaben/, its entries open until accepted; the entry for each class — new adds the requirement to its section; change changes it under its name with the current text beside it and its impact list; duplicate adds the new source; conflict is written only as resolved —; that every entry records the Agent M version, participant, model and date; and that the SPEC is unchanged until entries are accepted
test("explain — write-proposals: the queue Write proposals writes (UC-005 step 8)", () => {
  assertClaims("write-proposals", [
    [/Write proposals is one click/, "Write proposals is one click"],
    [/writes a new queue under docs\/spec-freigaben\//, "it writes a new queue under docs/spec-freigaben/"],
    [/open until someone accepts them/, "the entries are open until someone accepts them"],
    [/a new candidate, an entry that adds the requirement to its section/, "a new candidate gets an entry that adds the requirement to its section"],
    [/changing it under its name, with the current text beside it and its impact list/, "a change is made under the existing name, with the current text beside it and its impact list"],
    [/a duplicate, an entry that adds the new source to the existing requirement/, "a duplicate adds the new source to the existing requirement"],
    [/a conflict, an entry only as you resolved it/, "a conflict is written only as resolved"],
    [/records the Agent M version, the participant, the model and the date/, "every entry records the Agent M version, participant, model and date"],
    [/The SPEC itself is unchanged until you accept entries/, "the SPEC is unchanged until entries are accepted"],
  ]);
});
