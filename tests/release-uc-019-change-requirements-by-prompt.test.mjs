// Independent ITM-418 requirements release battery, authored by Developer terra-d.
// Successor: Team 2 Developer itm475-integration; implemented no UC-019 production behavior.
// Original cases: TST-418101..104 by terra-d. Added cases: TST-418105..121 and counterproofs by the successor.
// Module: MOD-review-pages; MOD-trace-pages; MOD-spec-changes; MOD-source-register; MOD-job-runner; MOD-runtimes
// Guards: UC-019
// Level: release
// Run: node --test tests/release-uc-019-change-requirements-by-prompt.test.mjs
// All endpoint and repository traffic is controlled by app-harness; no paid service is called.

import test, { after } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { press } from "./app-harness.mjs";
import { ask, bridgeAt } from "../src/bridge-client/index.mjs";
import { view as reviewPages } from "../src/review-pages/index.mjs";
import { startRecord } from "../src/job-ledger/index.mjs";
import { scenario, fromTrace, prepare, run, save, all, one, row, namedButton, draft, candidate,
  SOURCE, LOAN, SHELF, CONFLICT, CHANGED, INSTRUCTION, SPEC, CURRENT_RULE, proposalWrites, proposalTexts, recordTexts, assertProposal } from "./system-uc-019-change-requirements-by-prompt.test.mjs";

// UC-only exclusions from this requirements battery:
// A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT: UC-019 6b applies this to a reviewed use-case file;
//   requirements proposals are instead shown beside the current SPEC section.
// A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS: only use-case targets have realised requirements and neighbour use cases.
// NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY: the use-case context branch is distinct from the requirement context.
// AN EDITED FILE KEEPS ITS IDENTIFIER: its SPEC rule enumerates use cases, architecture decisions and tests;
//   requirement names follow the separate change/rename rules below.

// TST-418101
// level: release
// module: MOD-review-pages; MOD-source-register
// guards: UC-019; THE PERSON WHO PROMPTS IS A SOURCE
// given: author github.com/akmaier uses their instance to edit bob/lending-tool; only SRC-author is linked
// input: the public trace prompt control followed by Run and Save
// expect: the author is not mistaken for bob; the job and proposal name SRC-author, despite the different product owner
test("TST-418101: prompting source follows the author account, not the product owner", async () => {
  const s = await scenario({ owner: "bob" });
  await fromTrace(s);
  assert.equal(all(s.target, "p", "no-source").length, 0, "the linked author source is available when the product owner differs");
  await run(s);
  assert.match(recordTexts(s)[0], /"source": "SRC-author"/);
  await save(s);
  assert.match(assertProposal(s), /SRC-author/);
});

// TST-418102
// level: release
// module: MOD-review-pages; MOD-runtimes
// guards: UC-019; ONE DEFINITION, THREE DRIVERS
// given: the endpoint record names paired Bridge release-bridge, with its configured loopback address and token
// input: the public requirement flow prepares and runs change-requirements
// expect: no direct model request; one POST /v1/ask to that named Bridge carries the same instruction and context
test("TST-418102: a named Bridge endpoint uses the Bridge transport in the public flow", async () => {
  const s = await scenario({ bridge: true });
  const positive = await ask(bridgeAt({ address: "http://127.0.0.1:9418", token: "fixture-pairing-token" }),
    { endpoint: { name: "fixture", baseUrl: "https://fixture-endpoint.example.test/v1", kind: "openai-compatible", model: "fixture-model", key: null } }, INSTRUCTION);
  assert.deepEqual(JSON.parse(positive.text).draft, draft(), "known positive: the actual Bridge client reads the fixture draft");
  assert.deepEqual(s.bridgeRequests.map((request) => [request.method, new URL(request.url).pathname]), [["POST", "/v1/ask"], ["GET", "/v1/ask/fixture-ask"]]);
  assert.ok(s.bridgeRequests.every((request) => request.headers["x-agent-m-bridge-token"] === "fixture-pairing-token"));
  s.bridgeRequests.length = 0;
  await run(s);
  assert.equal(s.endpointRequests.length, 0, "a named Bridge endpoint is never contacted directly");
  const asks = s.bridgeRequests.filter((request) => request.method === "POST" && request.url.endsWith("/v1/ask"));
  assert.equal(asks.length, 1, "one exchange goes through the configured named Bridge");
  assert.match(JSON.stringify(asks[0].body), /Make the due date visible\./);
  assert.match(JSON.stringify(asks[0].body), /A LOAN HAS A DUE DATE/);
  await save(s);
  assertProposal(s);
});

// TST-418103
// level: release
// module: MOD-review-pages; MOD-source-register
// guards: UC-019; A CONFLICT IS DECIDED BY A PERSON
// given: a candidate from SRC-author (advisory) conflicts with LOAN from SRC-policy (normative)
// input: Run and inspect the undecided conflict beside the existing requirement (UC-019 8a)
// expect: both sources and both authorities are visible in that conflict's panel before any decision or write
test("TST-418103: the conflict panel shows both sources and their authority", async () => {
  const s = await scenario({ answers: [draft(candidate({ name: CONFLICT, class: "conflict", rule: "Every loan may hide its due date." }))] });
  await run(s);
  const conflict = row(s, CONFLICT);
  for (const text of [SOURCE, "advisory", "SRC-policy", "normative"]) assert.ok(conflict.textContent.includes(text), `the conflict shows ${text}`);
  assert.equal(proposalWrites(s).length, 0);
});

// TST-418104
// level: release
// module: MOD-review-pages; MOD-site-frame; MOD-runtimes
// guards: UC-019; THE PAGE STATES WHAT IT SENDS WHERE
// given: a returned editable draft and a follow-up instruction
// input: edit the draft and press Refine, inspect the renewed disclosure, then press Run (UC-019 step 8 repeats 5-7)
// expect: Refine exposes the current draft and follow-up in a new run panel before sending; Run makes exactly one further exchange
test("TST-418104: Refine repeats disclosure and the send decision before another exchange", async () => {
  const s = await scenario({ answers: [draft(), draft(candidate({ rule: "Every loan displays its final due date." }))] });
  await run(s);
  const edit = one(row(s), "textarea", "candidate-rule");
  edit.value = "Every loan displays the author's current draft.";
  one(s.target, "textarea", "refinement").value = "Make the display final.";
  await press(s.server, namedButton(s.target, "Refine"));
  assert.equal(s.endpointRequests.length, 1, "the new panel precedes the next sending decision");
  const panels = all(s.target, "section", "run-panel");
  assert.ok(panels.some((panel) => panel.textContent.includes("Make the display final.") && panel.textContent.includes("current draft")), "the renewed panel discloses the follow-up and current draft");
  const go = all(s.target, "button").find((button) => button.textContent === "Run" && !button.disabled);
  assert.ok(go, "the renewed panel offers its Run decision");
  await press(s.server, go);
  assert.equal(s.endpointRequests.length, 2);
  assert.match(JSON.stringify(s.endpointRequests[1].body), /author's current draft/);
  assert.match(JSON.stringify(s.endpointRequests[1].body), /Make the display final\./);
});

const sentText = (s, at = 0) => s.endpointRequests[at].body.messages[0].content;
const resultOf = (s) => one(s.target, "section", "requirements-result");
const runPrepared = (s) => press(s.server, namedButton(s.target, "Run"));

// TST-418105
// level: release
// module: MOD-review-pages; MOD-participant-list; MOD-site-frame
// guards: UC-019; A PARTICIPANT DECLARES ITS CAPABILITIES; A PARTICIPANT DECLARES WHERE IT PROCESSES DATA; EVERY STEP EXPLAINS ITSELF
// given: draft-capable endpoint and CI participants, plus a read-only observer
// input: follow the public prompt route, choose the endpoint, prepare and Run
// expect: only drafters are selectable, each processing place is visible, and every decision stage has a folded explanation
test("TST-418105: eligible participants, processing places and folded explanations are visible", async () => {
  const s = await scenario();
  await fromTrace(s);
  assert.deepEqual(all(s.target, "input", "participant").map((node) => node.value), ["drafter", "ci-drafter"]);
  for (const name of ["this machine", "GitHub Actions in the USA"]) assert.ok(s.target.textContent.includes(name));
  const explanations = () => all(s.target, "details").filter((node) => node.textContent.includes("What is this?"));
  assert.ok(explanations().length >= 2);
  assert.ok(explanations().every((node) => !node.open));
  await prepare(s);
  assert.ok(explanations().length >= 3);
  await runPrepared(s);
  assert.ok(all(resultOf(s), "details").length > 0);
});

// TST-418106
// level: release
// module: MOD-review-pages; MOD-spec-changes; MOD-job-runner
// guards: UC-019; DERIVATION SEES THE EXISTING REQUIREMENTS; A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES; A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING; THE PAGE STATES WHAT IT SENDS WHERE
// given: two SPEC requirements and an actual open proposal generated by the public Save flow
// input: prepare a new job against that repository, inspect disclosure, then Run
// expect: no send before Run; the endpoint receives the instruction, both SPEC rules, the queued rule, and chapter 8 byte-for-byte
test("TST-418106: complete SPEC, open queues and the whole original chapter reach the participant", async () => {
  const queued = await scenario({ answers: [draft(candidate({ name: "A LOAN IS RENEWABLE", class: "new", of: undefined, rule: "Every loan permits renewal." }))] });
  await run(queued); await save(queued);
  const extraFiles = Object.fromEntries(Object.entries(queued.product.files).filter(([path]) => path.startsWith("docs/spec-freigaben/")));
  assert.ok(Object.keys(extraFiles).length >= 4, "known positive: a real open queue was generated");
  const s = await scenario({ extraFiles });
  const panel = await prepare(s);
  assert.match(panel.textContent, /drafter.*model: fixture-model.*processes data at: this machine/s);
  assert.match(panel.textContent, /SPEC.md with its open queues/);
  assert.equal(s.endpointRequests.length, 0);
  await runPrepared(s);
  const text = sentText(s);
  for (const required of [INSTRUCTION, LOAN, SHELF, CURRENT_RULE, "Every book has a shelf.", "A LOAN IS RENEWABLE", "Every loan permits renewal.", s.chapter]) assert.ok(text.includes(required), `complete input includes ${required.slice(0, 70)}`);
  assert.equal(proposalWrites(s).length, 0);
});

// TST-418107
// level: release
// module: MOD-review-pages; MOD-job-runner; MOD-site-frame
// guards: UC-019; NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
// given: the complete requirements/chapter context and a participant with a one-token capacity
// input: prepare the job (UC-019 4a)
// expect: a capacity diagnosis precedes any request, Run is absent, all parts remain disclosed, and nothing is written
test("TST-418107: a too-small context stops without truncation or a send decision", async () => {
  const s = await scenario({ context: 1 });
  const panel = await prepare(s);
  assert.match(one(panel, "p", "not-fitting").textContent, /drafter cannot hold.*context holds 1/);
  assert.equal(all(panel, "button").some((node) => node.textContent === "Run"), false);
  assert.match(panel.textContent, /SPEC.md with its open queues/);
  assert.equal(s.endpointRequests.length, 0); assert.equal(s.product.writes.length, 0);
});

// TST-418108
// level: release
// module: MOD-review-pages; MOD-job-runner; MOD-documents
// guards: UC-019; A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT; EXACT DUPLICATES ARE FOUND WITHOUT A MODEL
// given: one new, changed, restated and conflicting candidate, with the restatement wrongly classed new
// input: Run twice through the deterministic correction loop, correcting the duplicate classification
// expect: the duplicate finding names LOAN before any extra model classification; the editor exposes all four actual classes
test("TST-418108: deterministic duplicate correction retains the four candidate classes", async () => {
  const fresh = candidate({ name: "A LOAN IS RENEWABLE", rule: "Every loan permits renewal.", class: "new", of: undefined });
  const duplicate = candidate({ name: "A DUE DATE IS STATED", rule: CURRENT_RULE, class: "new", of: undefined });
  const conflict = candidate({ name: CONFLICT, rule: "Every loan may hide its due date.", class: "conflict" });
  const s = await scenario({ answers: [draft(fresh, candidate(), duplicate, conflict), draft(fresh, candidate(), { ...duplicate, class: "duplicate", of: LOAN }, conflict)] });
  await run(s);
  assert.equal(s.endpointRequests.length, 2);
  assert.match(sentText(s, 1), /EXACT DUPLICATES ARE FOUND WITHOUT A MODEL/);
  assert.match(sentText(s, 1), /class it as duplicate of A LOAN HAS A DUE DATE/);
  assert.deepEqual(all(resultOf(s), "select", "class").map((node) => node.value), ["new", "change", "duplicate", "conflict"]);
});

// TST-418109
// level: release
// module: MOD-review-pages; MOD-spec-changes; MOD-markdown-render
// guards: UC-019; A CHANGE IS PROPOSED UNDER THE EXISTING NAME; A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT
// given: a changed candidate whose display name differs from its existing target
// input: inspect its current-text difference, edit the rule, then Save
// expect: old and new lines are shown before Save; the proposal retains LOAN, excludes the candidate name, and preserves SHELF
test("TST-418109: a changed rule is compared and proposed under its existing identifier", async () => {
  const s = await scenario(); await run(s);
  assert.ok(one(row(s), "section", "current-requirement").textContent.includes(CURRENT_RULE));
  const difference = one(row(s), "section", "candidate-difference");
  assert.ok(difference.textContent.includes(CURRENT_RULE));
  assert.ok(difference.textContent.includes(candidate().rule));
  await save(s);
  const text = assertProposal(s);
  assert.ok(text.includes(`**${LOAN}**`)); assert.ok(!text.includes(`**${CHANGED}**`));
  assert.ok(text.includes(`**${SHELF}** *(SRC-policy)*\nEvery book has a shelf.`));
});

// TST-418110
// level: release
// module: MOD-review-pages; MOD-spec-changes; MOD-job-runner
// guards: UC-019; A SPEC EDIT IS SAVED AS A PROPOSAL; A GENERATED ARTIFACT IS A PROPOSAL; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; ONE CLICK PER DECISION; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
// given: an untouched page, a prepared job and an editable result
// input: pause before Run and Save, then press each once
// expect: no repository write before Run, no proposal before Save; one Save writes one open queue, unchanged SPEC and complete commit provenance
test("TST-418110: explicit Run and one Save preserve proposal state and complete provenance", async () => {
  const s = await scenario(); await prepare(s);
  assert.equal(s.product.writes.length, 0); assert.equal(s.endpointRequests.length, 0);
  await runPrepared(s);
  assert.equal(proposalWrites(s).length, 0);
  await save(s); assertProposal(s);
  const write = proposalWrites(s)[0];
  for (const trailer of ["Agent-M-Version:", "Agent-M-Job:", "Agent-M-Kind: change-requirements", "Agent-M-Participant: drafter", "Agent-M-Model: fixture-model", "Agent-M-Rounds: 1", `Agent-M-Instruction: ${INSTRUCTION}`]) assert.ok(write.message.includes(trailer), trailer);
  const decisions = Object.entries(write.files).find(([path]) => path.endsWith("/entscheidungen.md"));
  assert.ok(decisions); assert.doesNotMatch(decisions[1], /akzeptiert|accepted/i);
  assert.match(recordTexts(s)[0], /start: \d{4}-\d{2}-\d{2}/);
});

// TST-418111
// level: release
// module: MOD-review-pages; MOD-spec-changes
// guards: UC-019; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT
// given: an exact authored draft followed by a concurrent target-section change
// input: Save
// expect: zero additional write and the exact draft retained beside that newer section
test("TST-418111: stale Save retains the exact edit beside the newer baseline", async () => {
  const s = await scenario(); await run(s);
  const edit = one(row(s), "textarea", "candidate-rule"); edit.value = "Every loan shows the person's retained edit.";
  await s.product.change("SPEC.md", SPEC.replace(CURRENT_RULE, "Every loan states its revised due date."));
  const before = s.product.writes.length; await save(s);
  assert.equal(s.product.writes.length, before);
  assert.equal(edit.value, "Every loan shows the person's retained edit.");
  assert.match(one(s.target, "div", "newer").textContent, /Every loan states its revised due date\./);
});

// TST-418112
// level: release
// module: MOD-review-pages; MOD-job-runner
// guards: UC-019; A CONFLICT IS DECIDED BY A PERSON; WHAT A PERSON DECIDES IS NOT SENT BACK
// given: one otherwise valid conflicting requirement
// input: Run, Save while undecided, then choose change and Save
// expect: one endpoint call, no automatic conflict correction, zero proposal while undecided, then the person's exact decision in one proposal
test("TST-418112: the person alone decides a conflict without another participant call", async () => {
  const s = await scenario({ answers: [draft(candidate({ name: CONFLICT, class: "conflict", rule: "Every loan may hide its due date." }))] });
  await run(s); assert.equal(s.endpointRequests.length, 1);
  await save(s); assert.equal(proposalWrites(s).length, 0);
  assert.match(s.target.textContent, /ConflictUndecided/);
  one(row(s, CONFLICT), "select", "class").value = "change";
  await save(s); assertProposal(s); assert.equal(s.endpointRequests.length, 1);
});

// TST-418113
// level: release
// module: MOD-review-pages; MOD-runtimes; MOD-job-runner
// guards: UC-019; A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; A FINDING READS LIKE A COMPILER MESSAGE; AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED; THE ROUNDS ARE COUNTED AND SHOWN
// given: a candidate missing its check, followed by the corrected candidate
// input: Run
// expect: the same endpoint receives draft and compiler-complete finding; only the corrected draft reaches the editor; both rounds are displayed and recorded
test("TST-418113: an invalid draft goes back with its complete compiler finding", async () => {
  const s = await scenario({ answers: [draft(candidate({ check: "" })), draft()] }); await run(s);
  assert.equal(s.endpointRequests.length, 2);
  const correction = sentText(s, 1);
  assert.match(correction, /A DUE DATE IS VISIBLE:\d+: error: no check \[A REQUIREMENT HAS FOUR FIELDS\].*add a line/);
  assert.match(correction, /Current draft to change/);
  assert.equal(one(row(s), "textarea", "candidate-check").value, candidate().check);
  assert.match(one(resultOf(s), "p", "rounds").textContent, /Correction rounds: 2/);
  assert.match(recordTexts(s)[0], /Round 1.*A REQUIREMENT HAS FOUR FIELDS.*Round 2/s);
});

// TST-418114
// level: release
// module: MOD-review-pages; MOD-runtimes; MOD-job-runner
// guards: UC-019; AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED
// given: a rule with a conjunction, followed by the same rule and a one-line justification of its exact finding
// input: Run
// expect: two exchanges, justified warning recorded, no remaining finding and no silent rewrite of the author's rule
test("TST-418114: a warning ends only after its one-line justification", async () => {
  const both = draft(candidate({ rule: "Every loan shows its due date and its renewal limit." }));
  const s = await scenario({ answers: [both, (requests) => {
    const message = requests.at(-1).body.messages[0].content;
    const line = message.split("\n").find((line) => line.includes(": warning:") && line.includes("[ONE STATEMENT PER REQUIREMENT]"));
    assert.ok(line, "the participant receives the warning to justify");
    return { draft: both, answers: [{ finding: line.replace(" - ", " \u2014 ") + ".", how: "justified", text: "Both displays form one visible state." }] };
  }] }); await run(s);
  assert.equal(s.endpointRequests.length, 2);
  assert.equal(all(one(resultOf(s), "ul", "left"), "li").length, 0);
  assert.match(recordTexts(s)[0], /justified: Both displays form one visible state\./);
  assert.equal(one(row(s), "textarea", "candidate-rule").value, both.candidates[0].rule);
});

// TST-418115
// level: release
// module: MOD-review-pages; MOD-job-runner
// guards: UC-019; THE CORRECTION LOOP HAS A FIXED LIMIT; THE ROUNDS ARE COUNTED AND SHOWN; A FINDING READS LIKE A COMPILER MESSAGE
// given: five different invalid drafts that cannot trigger an unchanged-round early stop
// input: inspect the default limit before Run, then Run
// expect: exactly five exchanges; the editor shows round count and the last artifact, line, error kind, named rule and expected correction
test("TST-418115: the declared five-round cap retains compiler-complete remaining findings", async () => {
  const answers = Array.from({ length: 5 }, (_, i) => draft(candidate({ name: `VISIBLE DUE DATE ${i}`, check: "" })));
  const s = await scenario({ answers }); const panel = await prepare(s);
  assert.match(one(panel, "p", "limit").textContent, /at most 5/); await runPrepared(s);
  assert.equal(s.endpointRequests.length, 5);
  assert.match(one(resultOf(s), "p", "rounds").textContent, /Correction rounds: 5/);
  assert.match(one(resultOf(s), "ul", "left").textContent, /VISIBLE DUE DATE 4:\d+: error: no check \[A REQUIREMENT HAS FOUR FIELDS\].*add a line/);
  assert.match(recordTexts(s)[0], /stopped because: limit.*limit: 5/);
});

// TST-418116
// level: release
// module: MOD-review-pages; MOD-job-runner
// guards: UC-019; THE CORRECTION LOOP HAS A FIXED LIMIT; A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
// given: the same invalid draft on every exchange
// input: Run
// expect: the unchanged finding ends the loop after two exchanges, with its remaining finding and no proposal
test("TST-418116: an unchanged finding stops early without writing a proposal", async () => {
  const s = await scenario({ answers: [draft(candidate({ check: "" }))] }); await run(s);
  assert.equal(s.endpointRequests.length, 2); assert.equal(proposalWrites(s).length, 0);
  assert.match(one(resultOf(s), "ul", "left").textContent, /no check/);
  assert.match(recordTexts(s)[0], /stopped because: unchanged/);
});

// TST-418117
// level: release
// module: MOD-review-pages; MOD-job-runner
// guards: UC-019; A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; A GENERATED ARTIFACT IS A PROPOSAL
// given: a participant repeatedly returning malformed artifact text (UC-019 6c)
// input: prepare and Run
// expect: two correction exchanges, a named unusable result, exact raw answer folded, no candidate editor, Save or proposal
test("TST-418117: an unusable answer remains folded and cannot be saved", async () => {
  const raw = "not an artifact: retained verbatim";
  const s = await scenario({ answers: [raw] }); await prepare(s); await runPrepared(s);
  assert.equal(s.endpointRequests.length, 2);
  assert.equal(all(s.target, "p", "unusable").length, 1);
  const folded = one(s.target, "details", "raw"); assert.ok(!folded.open);
  assert.equal(one(folded, "pre", "answer").textContent, raw);
  assert.equal(all(s.target, "section", "requirements-result").length, 0);
  assert.equal(all(s.target, "button").some((node) => node.textContent === "Save"), false);
  assert.equal(proposalWrites(s).length, 0); assert.equal(s.product.files["SPEC.md"], SPEC);
});

// TST-418118
// level: release
// module: MOD-review-pages; MOD-spec-changes
// guards: UC-019; A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED
// given: the UC-018 requirement editor that UC-019's freely editable requirement result relies on
// input: rename LOAN to CHANGED, inspect its impact, then Save once with a reason
// expect: the impact explicitly withdraws LOAN and adds CHANGED; the proposal has only the new name, while SPEC remains unchanged
test("TST-418118: a manual requirement rename is proposed as withdrawal plus addition", async () => {
  const s = await scenario();
  await reviewPages.routes.find((route) => route.name === "requirement").render(s.target, s.viewContext, { name: LOAN });
  const area = all(s.target, "textarea").find((node) => !node.className.split(/\s+/).includes("why"));
  assert.ok(area); area.value = area.value.replace(`**${LOAN}**`, `**${CHANGED}**`); await area.fire("input");
  assert.match(one(s.target, "ul", "impact").textContent, /A LOAN HAS A DUE DATE.*withdrawn.*A DUE DATE IS VISIBLE.*added/s);
  one(s.target, "textarea", "why").value = "Use the displayed name.";
  await save(s);
  assert.equal(s.product.files["SPEC.md"], SPEC); assert.equal(proposalWrites(s).length, 1);
  const text = proposalTexts(s).join("\n"); assert.ok(text.includes(`**${CHANGED}**`)); assert.ok(!text.includes(`**${LOAN}**`));
});

// TST-418119
// level: release
// module: MOD-review-pages; MOD-spec-changes
// guards: UC-019; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT; THE PAGE STATES WHAT IT SENDS WHERE
// given: a draft followed by a newer SPEC section while the author refines
// input: Refine, Run, inspect the new current text, then Save
// expect: refinement uses the latest snapshot for both difference and Save, not the first draft's stale baseline
test("TST-418119: a refined draft uses the latest disclosed section as its Save baseline", async () => {
  const s = await scenario({ answers: [draft(), draft(candidate({ rule: "Every loan displays its final due date." }))] }); await run(s);
  const newer = SPEC.replace(CURRENT_RULE, "Every loan states its revised due date."); await s.product.change("SPEC.md", newer);
  one(s.target, "textarea", "refinement").value = "Make the display final.";
  await press(s.server, namedButton(s.target, "Refine"));
  assert.equal(s.endpointRequests.length, 1);
  await press(s.server, all(s.target, "button").find((node) => node.textContent === "Run" && !node.disabled));
  assert.match(sentText(s, 1), /Every loan states its revised due date\./);
  assert.match(one(row(s), "section", "current-requirement").textContent, /Every loan states its revised due date\./);
  await save(s); assert.equal(proposalWrites(s).length, 1); assert.equal(s.product.files["SPEC.md"], newer);
});

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const git = (cwd, ...args) => {
  const result = spawnSync("git", args, { cwd, encoding: "utf8", env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_TERMINAL_PROMPT: "0" } });
  assert.equal(result.status, 0, result.stderr);
  return args[0] === "show" ? result.stdout : result.stdout.trim();
};
function workflowRepository(root, name, files) {
  const origin = join(root, `${name}.git`), checkout = join(root, "ws", name);
  git(root, "init", "-q", "--bare", "-b", "main", origin);
  git(root, "clone", "-q", origin, checkout);
  git(checkout, "config", "user.name", "Independent release fixture");
  git(checkout, "config", "user.email", "fixture@example.org");
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(checkout, path, ".."), { recursive: true }); writeFileSync(join(checkout, path), text);
  }
  git(checkout, "add", "-A"); git(checkout, "commit", "-q", "-m", "Fixture baseline");
  git(checkout, "push", "-q", "origin", "HEAD:refs/heads/main");
  return { origin, checkout, commit: git(checkout, "rev-parse", "HEAD") };
}

// TST-418120
// level: release
// module: MOD-review-pages; MOD-workflow-entries; MOD-spec-changes; MOD-job-runner
// guards: UC-019; A CI AGENT'S DRAFT ENTERS AS OPEN; ONE DEFINITION, THREE DRIVERS; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
// given: the public CI selection and a local workflow workspace with the endpoint-bearing record contract used by the existing working CI runner
// input: click Run to queue, then invoke the real onRecordsChanged entry on a fresh queued CI record
// expect: the tab neither contacts the endpoint nor offers an editor; the actual workflow writes an undecided queue to main with provenance, never SPEC or an acceptance
test("TST-418120: the actual CI entry commits requirements only as an open proposal", async () => {
  const s = await scenario(); await prepare(s, { participant: "ci-drafter" }); await runPrepared(s);
  assert.equal(s.endpointRequests.length, 0); assert.equal(all(s.target, "section", "requirements-result").length, 0);
  assert.equal(all(s.target, "p", "queued").length, 1); assert.equal(proposalWrites(s).length, 0);
  const root = mkdtempSync(join(tmpdir(), "agent-m-418-ci-"));
  try {
    mkdirSync(join(root, "ws"));
    const instance = workflowRepository(root, "instance", s.server.files);
    const agentM = { version: "2026.10.0", commit: instance.commit }, id = "JOB-20261014-0900-a418";
    const record = startRecord({ id, kind: "change-requirements", worksOn: [LOAN], participant: "ci-drafter", model: "ci-model", route: "ci hosted",
      run: null, retries: null, startedBy: "github.com/akmaier", start: new Date("2026-10-14T09:00:00Z"), agentM,
      inputs: [LOAN], limit: 5, destinations: [{ participant: "ci-drafter", place: "GitHub Actions in the USA", parts: [LOAN] }],
      params: { requirements: [LOAN], source: SOURCE, instruction: INSTRUCTION,
        endpoint: { name: "fixture", kind: "openai-compatible", baseUrl: "https://fixture-endpoint.example.test/v1", model: "ci-model" } } });
    const product = workflowRepository(root, "product", { ...Object.fromEntries(Object.entries(s.product.files).filter(([path]) => !path.startsWith("docs/jobs/"))), [record.path]: record.text });
    const environment = { GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "push", GITHUB_WORKSPACE: join(root, "ws"),
      GITHUB_SERVER_URL: "https://github.com", GITHUB_REPOSITORY: s.repo, GITHUB_REF_NAME: "main", GITHUB_SHA: product.commit,
      GITHUB_RUN_ID: "418", GITHUB_ACTOR: "akmaier", AGENT_M_RUNNER: "hosted", AGENT_M_PRODUCT_DIR: product.checkout,
      AGENT_M_TOKEN_NAME: "AGENT_M_TOKEN", AGENT_M_KEY_NAMES: "CI_KEY", AGENT_M_TOKEN: "fixture-person-token", CI_KEY: "fixture-model-key" };
    // CI owns a fresh registry in its own process, not the dashboard's already-registered strategies.
    const script = `import {runEntry} from ${JSON.stringify(new URL("../src/workflow-entries/main.mjs", import.meta.url).href)};
      const requests=[]; globalThis.fetch=async(url,init={})=>{if(!String(url).startsWith("https://fixture-endpoint.example.test/"))throw Error("uncontrolled request: "+url);requests.push(JSON.parse(init.body));return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({draft:${JSON.stringify(draft())},answers:[]})}}]}),{status:200})};
      const status=await runEntry("onRecordsChanged",${JSON.stringify(environment)},{now:new Date("2026-10-14T09:01:00Z")});console.log(JSON.stringify({status,requests}));`;
    const env = { ...process.env }; delete env.NODE_TEST_CONTEXT;
    const invoked = spawnSync(process.execPath, ["--input-type=module", "-e", script], { cwd: ROOT, env, encoding: "utf8", timeout: 15000 });
    assert.equal(invoked.status, 0, invoked.stderr);
    const { status, requests } = JSON.parse(invoked.stdout);
    assert.equal(status.outcome, "done", status.summary); assert.equal(requests.length, 1);
    assert.ok(requests[0].messages[0].content.includes(INSTRUCTION)); assert.ok(requests[0].messages[0].content.includes(SHELF));
    assert.equal(git(product.origin, "show", "main:SPEC.md"), SPEC);
    const paths = git(product.origin, "ls-tree", "-r", "--name-only", "main").split("\n");
    assert.ok(paths.some((path) => path.endsWith(".begruendung.md")));
    assert.ok(!paths.some((path) => path.startsWith("docs/approvals/")));
    const decisions = paths.find((path) => path.endsWith("/entscheidungen.md")); assert.ok(decisions);
    assert.doesNotMatch(git(product.origin, "show", `main:${decisions}`), /akzeptiert|accepted/i);
    const messages = git(product.origin, "log", "--format=%B", "main");
    for (const line of [`Agent-M-Version: ${agentM.version}`, "Agent-M-Participant: ci-drafter", "Agent-M-Model: ci-model", "Agent-M-Rounds: 1", `Agent-M-Instruction: ${INSTRUCTION}`]) assert.ok(messages.includes(line), line);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// TST-418121
// level: release
// module: MOD-review-pages; MOD-site-frame
// guards: UC-019; THE PAGE STATES WHAT IT SENDS WHERE
// given: two existing requirements and no use-case input in the requirements branch
// input: prepare without Run (UC-019 step 5)
// expect: the run panel states both included counts before the sending decision
test("TST-418121: the run panel states included requirement and use-case counts before sending", async () => {
  const s = await scenario(); const panel = await prepare(s);
  assert.match(panel.textContent, /2\s+(?:existing\s+)?requirements?\s+(?:included|sent)/i);
  assert.match(panel.textContent, /0\s+use[ -]cases?\s+(?:included|sent)/i);
  assert.equal(s.endpointRequests.length, 0); assert.equal(s.product.writes.length, 0);
});

// Counterproofs are requested explicitly; ordinary CI still runs every behavior case. Each fault is confined to a copied
// source tree. The same unchanged case must fail normally, then pass after byte-exact restoration, before its receipt is emitted.
const FAULTS = [
  { ids: ["TST-418001"], file: "src/trace-pages/flow.mjs", from: 'if (editable) detail.append(reviewLink("requirement-prompt"', to: 'if (false) detail.append(reviewLink("requirement-prompt"' },
  { ids: ["TST-418002", "TST-418003", "TST-418110"], file: "src/spec-changes/propose.mjs", from: 'files.push({ path: proposalPath, text: change.text }', to: 'files.push({ path: change.target, text: change.text }' },
  { ids: ["TST-418004"], file: "src/review-pages/requirements-prompt.mjs", from: 'if (!source) {', to: 'if (false) {' },
  { ids: ["TST-418005", "TST-418112"], file: "src/review-pages/requirements-prompt.mjs", from: 'if (edited.classes.some((each) => each.class === "conflict"))', to: 'if (false)' },
  { ids: ["TST-418006", "TST-418111"], file: "src/review-pages/requirements-prompt.mjs", from: 'if (await blobSha(current) !== opened.get(section.anchor))', to: 'if (false)' },
  { ids: ["TST-418101"], file: "src/review-pages/requirements-prompt.mjs", from: 'accountOf(loaded.instanceSnapshot)', to: 'accountOf(snapshot)' },
  { ids: ["TST-418102"], file: "src/runtimes/tab.mjs", from: 'if (entry.bridge !== null)', to: 'if (false)' },
  { ids: ["TST-418103"], file: "src/review-pages/requirements-prompt.mjs", from: 'entry?.fields.authority ?? "authority not registered"', to: '"authority not registered"' },
  { ids: ["TST-418104"], file: "src/runtimes/tab.mjs", from: 'if (input.previous !== null && input.previous !== undefined)', to: 'if (false)' },
  { ids: ["TST-418105"], file: "src/review-pages/jobs.mjs", from: 'drafters: eligible(participants, { capabilities: definition.needs }).eligible', to: 'drafters: participants' },
  { ids: ["TST-418106"], file: "src/spec-changes/strategies.mjs", from: 'for (const queue of await queues(snapshot))', to: 'for (const queue of [])' },
  { ids: ["TST-418107"], file: "src/site-frame/run-panel.mjs", from: 'if (prepared.blocking.length === 0 && prepared.notFitting.length === 0)', to: 'if (true)' },
  { ids: ["TST-418108"], file: "src/job-runner/builtins.mjs", from: 'if (decided.decidedBy === "rule" &&', to: 'if (false && decided.decidedBy === "rule" &&' },
  { ids: ["TST-418109"], file: "src/review-pages/requirements-prompt.mjs", from: 'showDifference(held?.rule ?? "", rule.value)', to: 'renderArtifact(held?.rule ?? "")' },
  { ids: ["TST-418113"], file: "src/runtimes/tab.mjs", from: 'if (input.findings?.length)', to: 'if (false)' },
  { ids: ["TST-418114"], file: "src/job-runner/loop.mjs", from: 'settled.add(line(found))', to: 'settled.delete(line(found))' },
  { ids: ["TST-418115"], file: "src/job-runner/loop.mjs", from: 'number >= prepared.limit', to: 'number >= 3' },
  { ids: ["TST-418116"], file: "src/job-runner/loop.mjs", from: 'number > 1 && now.length && same(now, open)', to: 'false' },
  { ids: ["TST-418117"], file: "src/review-pages/requirements-prompt.mjs", from: 'if (outcome.stoppedBecause === "unusable")', to: 'if (false)' },
  { ids: ["TST-418118"], file: "src/review-pages/edit.mjs", from: '...withdrawn.map((name)', to: '...[].map((name)' },
  { ids: ["TST-418119"], file: "src/review-pages/jobs.mjs", from: 'const snapshot = await defaultSnapshot(run.host);', to: 'const snapshot = run.snapshot;' },
  { ids: ["TST-418120"], file: "src/spec-changes/propose.mjs", from: 'files.push({ path: `${base}.md`, text: section.text }', to: 'files.push({ path: "SPEC.md", text: section.text }' },
];
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function counterproofs() {
  const temporary = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-418-fault-"))), copied = join(temporary, "agent-m");
  const tests = ["tests/system-uc-019-change-requirements-by-prompt.test.mjs", "tests/release-uc-019-change-requirements-by-prompt.test.mjs"];
  const receipts = [], receiptPath = join(tmpdir(), `agent-m-418-counterproof-${process.pid}.json`);
  try {
    cpSync(join(ROOT, "src"), join(copied, "src"), { recursive: true, filter: (path) => !path.split(/[\\/]/).includes("node_modules") });
    cpSync(join(ROOT, "docs"), join(copied, "docs"), { recursive: true });
    mkdirSync(join(copied, "tests"), { recursive: true });
    for (const file of [...tests, "tests/app-harness.mjs"]) cpSync(join(ROOT, file), join(copied, file));
    const testHashes = Object.fromEntries(tests.map((path) => [path, hash(readFileSync(join(copied, path)))]));
    for (const fault of FAULTS) {
      const path = join(copied, fault.file), original = readFileSync(path), text = original.toString();
      assert.ok(text.includes(fault.from), `known-positive fault point: ${fault.file}: ${fault.from}`);
      const mutated = Buffer.from(text.replace(fault.from, fault.to)); assert.notDeepEqual(mutated, original);
      const argv = [process.execPath, "--test", "--test-reporter=tap", "--test-name-pattern", fault.ids.join("|"), ...tests.map((path) => join(copied, path))];
      const env = { ...process.env, AGENT_M_418_FAULT_CHILD: "1" }; delete env.NODE_TEST_CONTEXT;
      const invoke = () => spawnSync(argv[0], argv.slice(1), { cwd: copied, env, encoding: "utf8", timeout: 20000, maxBuffer: 4 * 1024 * 1024 });
      const started = new Date().toISOString(); writeFileSync(path, mutated);
      const failed = invoke(); writeFileSync(path, original);
      const restoredHash = hash(readFileSync(path)), passed = invoke(), ended = new Date().toISOString();
      const nodes = Object.fromEntries(fault.ids.map((id) => [id, failed.stdout.match(new RegExp(`^not ok \\d+ - ${id}:[\\s\\S]*?(?=\\n# Subtest:|\\n1\\.\\.)`, "m"))?.[0] ?? null]));
      const receipt = { ...fault, cwd: copied, argv, environment: { AGENT_M_418_FAULT_CHILD: "1", NODE_TEST_CONTEXT: null },
        sourceHashes: { original: hash(original), planted: hash(mutated), restored: restoredHash }, testHashes, started, ended,
        red: { status: failed.status, signal: failed.signal, error: failed.error?.code ?? null, nodes, stdout: failed.stdout, stderr: failed.stderr },
        green: { status: passed.status, signal: passed.signal, error: passed.error?.code ?? null, stdout: passed.stdout, stderr: passed.stderr } };
      receipts.push(receipt); writeFileSync(receiptPath, JSON.stringify(receipts, null, 2));
      assert.equal(restoredHash, hash(original), "exact source bytes are restored before the positive");
      assert.equal(failed.status, 1, failed.stderr); assert.equal(failed.signal, null); assert.equal(failed.error, undefined);
      for (const id of fault.ids) assert.ok(nodes[id], `${id}: an actual named failure node, not an import or launcher failure`);
      assert.equal(passed.status, 0, passed.stdout + passed.stderr); assert.equal(passed.signal, null); assert.equal(passed.error, undefined);
      for (const id of fault.ids) assert.match(passed.stdout, new RegExp(`^ok \\d+ - ${id}:`, "m"));
      for (const [file, expected] of Object.entries(testHashes)) assert.equal(hash(readFileSync(join(copied, file))), expected, "test bytes stay unchanged");
      console.log(`ITM-418-counterproof ${JSON.stringify({ ids: fault.ids, source: fault.file, sourceHashes: receipt.sourceHashes, red: 1, green: 0, receiptPath })}`);
    }
  } finally { rmSync(temporary, { recursive: true, force: true }); }
}
if (process.env.AGENT_M_418_COUNTERPROOF === "1" && !process.env.AGENT_M_418_FAULT_CHILD) after(counterproofs);
