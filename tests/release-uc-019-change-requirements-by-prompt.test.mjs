// Independent ITM-418 requirements release battery, authored by Developer terra-d.
// Module: MOD-review-pages; MOD-trace-pages; MOD-spec-changes; MOD-source-register; MOD-job-runner; MOD-runtimes
// Guards: UC-019
// Level: release
// Run: node --test tests/release-uc-019-change-requirements-by-prompt.test.mjs
// All endpoint and repository traffic is controlled by app-harness; no paid service is called.

import test from "node:test";
import assert from "node:assert/strict";
import { press } from "./app-harness.mjs";
import { scenario, fromTrace, prepare, run, save, all, one, row, namedButton, draft, candidate,
  SOURCE, LOAN, CONFLICT, CHANGED, INSTRUCTION, proposalWrites, proposalTexts, recordTexts, assertProposal } from "./system-uc-019-change-requirements-by-prompt.test.mjs";

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
