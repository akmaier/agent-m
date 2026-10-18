// The explanations of arranging and of implementing (ITM-725) — MOD-site-frame's explain, for the folded What is this? of
// UC-021 (a group is only a heading) and of UC-024 (the route a process model prescribes, with a pointer to book ch. 6 and 7;
// the three kinds of coding participant and what each costs in setup, speed and isolation).
// Run: node --test tests/site-frame-arranging-implementing-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; UC-021; UC-024
// Level: unit
//
// It imports the module's existing browser harness, tests/site-frame.test.mjs, unchanged, as the other explanation tests do:
// the small DOM of tests/release-itm-275-bridge-frame.test.mjs cannot sanitise, so renderArtifact there shows the source
// escaped, and a test of the rendered text would test that fallback. What a test pins of a topic is what the use case says of the step, claim by claim; the
// three kinds of participant are pinned by the claims of UC-024's actors and step 5 and of the participant topics that
// already stand. Each test states its input and its expected result before it runs (given / input / expect).

import "./site-frame.test.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { renderArtifact } from "../src/markdown-render/index.mjs";
import { explain } from "../src/site-frame/index.mjs";

const EXPLANATIONS = readFileSync(new URL("../src/site-frame/explanations.md", import.meta.url), "utf8");
// The Markdown under `## <topic>`, up to the next such line; undefined where the file holds no such line.
const topicText = (topic) => EXPLANATIONS.split(/^## /m).slice(1).find((part) => part.startsWith(`${topic}\n`))
  ?.slice(topic.length + 1);
// The folded body's rendered text, as a person reads it: runs of whitespace collapsed to one space.
const bodyText = (topic) => (explain(topic).children[1]?.textContent ?? "").replace(/\s+/g, " ");

const TOPICS = ["group-is-a-heading", "implementation-route", "coding-participants"];

function assertClaims(topic, claims) {
  assert.ok(topicText(topic)?.trim(), `known positive: explanations.md holds the topic ${topic}`);
  const text = bodyText(topic);
  for (const [pattern, says] of claims) assert.match(text, pattern, `${topic}: it says ${says}`);
}

// TST-725001 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-021 (the folded What is this?); UC-024 (steps 1 and 5)
// given: explanations.md, and the three new topics of arranging and of implementing
// input: explain(topic) for each
// expect: each is the folded What is this? — a <details class="explain"> without the open attribute, holding <summary>What is this?</summary> and then the topic's Markdown rendered, in which no asterisk or backtick of the source is left standing
test("explain — each topic of arranging and of implementing is a folded What is this? with its text", () => {
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

// TST-725002 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-021 (the folded What is this? beside the arrangement)
// given: the topic group-is-a-heading
// input: explain("group-is-a-heading")
// expect: text saying a group is only a heading; it has no identifier; nothing realises or tests it; moving an item never changes the item; a group holds one kind of artifact and an item has one place; saving commits only the group file
test("explain — group-is-a-heading: a group is only a heading (UC-021)", () => {
  assertClaims("group-is-a-heading", [
    [/A group is only a heading/, "a group is only a heading"],
    [/has no identifier/, "a group has no identifier"],
    [/nothing realises it and no test guards it/, "nothing realises or tests a group"],
    [/Moving an item[^.]*changes where the item is listed and nothing about the item/, "moving an item never changes the item"],
    [/identifier, its file and its approval stay as they were/, "the item's identifier, file and approval stay as they were"],
    [/Renaming a group changes only its title/, "renaming a group changes only its title"],
    [/group holds one kind of artifact/, "a group holds one kind of artifact"],
    [/item has one place in its hierarchy/, "an item has one place"],
    [/commits only the group file of that kind/, "saving commits only the group file of that kind"],
    [/SPEC and every artifact file stay byte-identical/, "the SPEC and every artifact file stay byte-identical"],
  ]);
});

// TST-725003 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-024 (step 1, the table and the pointer to the book)
// given: the topic implementation-route
// input: explain("implementation-route")
// expect: text saying the process model decides how the software is assembled, the three rows of UC-024's table (plan-driven, Scrum, Kanban) with where the work comes from, what one job implements and the order, that every job is the same at its core, and the pointer to chapter 6 for the plan-driven models and chapter 7 for the agile ones
test("explain — implementation-route: the route a process model prescribes (UC-024 1)", () => {
  assertClaims("implementation-route", [
    [/process model decides how the software is assembled/, "the model decides how the software is assembled"],
    [/what one implementation job is, where its work comes from, in which order it is done and where it stops at a gate/, "what the model fixes"],
    [/plan-driven — V-model, waterfall, reuse-oriented/, "the plan-driven row"],
    [/the implementation plan/, "the plan-driven work comes from the implementation plan"],
    [/one step of the plan: a module, a subsystem's integration, or the system/, "a plan-driven job implements one step of the plan"],
    [/a phase's jobs start after the gate that closes the phase before/, "a phase's jobs start after the gate that closes the phase before"],
    [/Scrum/, "the Scrum row"],
    [/the team's sprint selection from the backlog/, "Scrum's work comes from the sprint selection"],
    [/after the items it builds on, within the sprint/, "Scrum's order"],
    [/Kanban/, "the Kanban row"],
    [/the ready items of the backlog/, "Kanban's work comes from the ready items"],
    [/under the work-in-progress limit/, "Kanban's order is under the work-in-progress limit"],
    [/writes failing tests first, then the code, on a branch/, "every job writes failing tests first, then the code, on a branch"],
    [/merged once the product's Definition of Done holds/, "the pull request is merged once the Definition of Done holds"],
    [/In the book Vibe Coding: chapter 6 for the plan-driven models, chapter 7 for the agile ones\./, "the pointer to chapters 6 and 7"],
  ]);
});

// TST-725004 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-024 (step 5 and its actors)
// given: the topic coding-participants
// input: explain("coding-participants")
// expect: text saying who may offer, then for each of the CLI agent (local bridge), the sandboxed agent (tunnel) and the CI agent (self-hosted runner) its setup, its speed where the accepted texts give one, and its isolation
test("explain — coding-participants: the three kinds compared in setup, speed and isolation (UC-024 5)", () => {
  assertClaims("coding-participants", [
    [/write to the repository/, "a coding participant declares write to the repository"],
    [/run code and tests/, "a coding participant declares run code and tests"],
    [/three kinds/, "there are three kinds"],
    [/CLI agent[^.]*through the local Bridge/, "a CLI agent is reached through the local Bridge"],
    [/signs in with its own login/, "the CLI agent's setup: its own login on that computer"],
    [/starts at once/, "the CLI agent's speed: it starts at once"],
    [/in a working folder of its own/, "the CLI agent's isolation: a working folder of its own on your machine"],
    [/sandboxed agent[^.]*through a tunnel/, "a sandboxed agent is reached through a tunnel"],
    [/inside a virtual machine or a container/, "the sandboxed agent's setup: a virtual machine or a container with a Bridge in it"],
    [/sees only what the sandbox holds/, "the sandboxed agent's isolation: it sees only what the sandbox holds"],
    [/CI agent[^.]*self-hosted runner/, "a CI agent runs in a workflow on a self-hosted runner"],
    [/install a self-hosted runner/, "the CI agent's setup: a self-hosted runner on the agent's machine"],
    [/only connects out/, "the CI agent's setup: the runner only connects out"],
    [/takes the time of a workflow run/, "the CI agent's speed: a job takes the time of a workflow run"],
    [/no key is needed and your\s+subscription pays/, "the CLI agent's cost: its own login, so no key and the person's subscription"],
    [/Setup/, "it compares setup"],
    [/Speed/, "it compares speed"],
    [/Isolation/, "it compares isolation"],
  ]);
  assert.doesNotMatch(bodyText("coding-participants"), /billed/, "no accepted text bills the self-hosted CI agent's calls, so the topic bills none");
});

// TST-725005 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF (no existing topic changes)
// given: explanations.md, and the topics participant-ci-agent, participant-cli-agent and participant-sandboxed-agent as they stood before ITM-725
// input: the SHA-256 of each topic's Markdown
// expect: each equals the digest of the text as it stood: the new topic changes none of the three it compares
test("explanations.md — the three participant topics stand unchanged beside the new comparison", () => {
  const stood = {
    "participant-ci-agent": "f782be756a3feb1716c953803fb53d65dd3e09cbc9e9601cbe95da07f204e968",
    "participant-cli-agent": "1c5be5454d87f2245bc86996ca1bb6dbf0b385c7ddfe54ba717ca8d5555cffd5",
    "participant-sandboxed-agent": "c3c6ad0c82addb85e87d07657bef308ffe89d41efc61238feafac306bc2244f8",
  };
  for (const [topic, digest] of Object.entries(stood)) {
    const text = topicText(topic);
    assert.ok(text?.trim(), `known positive: explanations.md holds the topic ${topic}`);
    assert.equal(createHash("sha256").update(text).digest("hex"), digest, `${topic}: its text is unchanged`);
  }
});
