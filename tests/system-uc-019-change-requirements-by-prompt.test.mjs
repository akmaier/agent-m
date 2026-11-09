// System scenarios of UC-019 for a change of requirements, through the prompt bar and the review pages' route `draft` (ITM-514).
// Authored by Developer developer-sonnet-e, who implemented none of ITM-507 (the route `draft`), ITM-508 (the specification browser's
// subject) or ITM-551; it implemented no UC-019 production behaviour.
// Module: MOD-trace-pages; MOD-review-pages; MOD-site-frame; MOD-prompt-bar; MOD-spec-changes; MOD-source-register; MOD-runtimes; MOD-job-runner
// Guards: UC-019
// Level: system
// Run: node --test tests/system-uc-019-change-requirements-by-prompt.test.mjs
//
// The page, the servers and the person's actions are the harness of tests/uc-019-prompt-bar-harness.mjs: MOD-site-frame's real `startPage` on the review page, over the real
// views of MOD-trace-pages and MOD-review-pages, the real MOD-prompt-bar, MOD-job-runner, MOD-runtimes and the real GitHub host, served in memory; the global `fetch`
// answers them and refuses every other origin, so nothing reaches the network.
//
// Each test states its input and its expected values in its own text; none reads an expected result from the SPEC, a use case or an
// architecture file. The counter-proofs (a planted fault in a copy of src/ and the test's failing result) are run by
// tests/release-uc-019-change-requirements-by-prompt.test.mjs (AGENT_M_418_COUNTERPROOF=1) and recorded in the pull request.
//
// Readings the texts leave open, which the tests state:
//   - "the open requirement" is the one a person opens with the control of the requirement's name on the specification browser, or the
//     requirement whose page of the review pages is shown; a group is open while its section's list is unfolded.
//   - "a requirement open in the specification browser" gives the bar a subject whose draft route is `draft`; the tests follow the bar's
//     button *Review the draft* to the address it writes, and read what that address shows.

import test from "node:test";
import assert from "node:assert/strict";
import { CHANGED, CONFLICT, CURRENT_RULE, INSTRUCTION, LOAN, SHELF, SPEC, all, assertProposal, barOf, candidate, draft, draftAddress, draftBox, fromTrace, goTo, keptDraft, messageLines, onRequirementPage, one,
  proposalWrites, recordTexts, review, run, save, scenario, send, sentText, statusOf, targetsOf, writesBeyondRecords } from "./uc-019-prompt-bar-harness.mjs";

// The prompting source as the saved proposal names it: the account of the instance's owner, github.com/akmaier (MOD-prompt-bar's `source`, MOD-source-register's personAccount),
// standing at the end of the source of each requirement the drafter adds or changes, with no passage of the instruction after it (UC-019 step 6).
const ACCOUNT_SOURCE = /github\.com\/akmaier\)\*/;

// TST-418001
// level: system
// module: MOD-trace-pages; MOD-site-frame; MOD-prompt-bar
// guards: UC-019; THE PAGE NAMES WHERE IT SENDS
// given: the specification browser of the product at its default branch, this browser's configuration offering the endpoint drafter (this machine, draft text) and the CLI session release-bridge:observer (Anthropic, USA, read the repository only)
// input: unfold Lending, open A LOAN HAS A DUE DATE without naming it in the bar, write the instruction in the bar and press Send with the participant drafter
// expect: before Send the bar names drafter with its place, the only participant that can do the kind, and not observer, and nothing has been sent; after it the one request to the endpoint holds the instruction and names exactly A LOAN HAS A DUE DATE under "The requirements to change"
test("TST-418001: the prompt bar on the specification browser names where it sends and takes the open requirement as the target", async () => {
  const s = await scenario();
  const bar = barOf(s);
  assert.equal(one(bar, "span", "participant").textContent, "drafter — this machine");
  assert.equal(all(bar, "option").length, 0, "observer cannot draft text, so there is nothing to choose among");
  await fromTrace(s);
  assert.equal(s.endpointRequests.length, 0, "nothing is sent while a requirement is only open");
  await send(s, INSTRUCTION, { participant: "drafter" });
  assert.equal(s.endpointRequests.length, 1);
  assert.ok(sentText(s).includes(INSTRUCTION), "the instruction reaches the participant");
  assert.deepEqual(targetsOf(s), [LOAN], "the requirement to change is the open one, not named by the author");
  assert.equal(writesBeyondRecords(s).length, 0);
});

// TST-418002
// level: system
// module: MOD-review-pages; MOD-site-frame; MOD-prompt-bar; MOD-job-runner; MOD-spec-changes; MOD-source-register
// guards: UC-019
// given: the page of the requirement A LOAN HAS A DUE DATE, its author's source linked, and a fixture endpoint that drafts one changed requirement
// input: the instruction in the bar, Send, Review the draft, edit the returned rule in the editor of the drafted section, Save
// expect: one request to the endpoint; before Save nothing is written but the record of the piece run in this tab; after it one commit with the author's exact edit as one open proposal, SPEC.md unchanged, the commit message without the instruction, and no job record but the piece's, on the tab's route, without the instruction
test("TST-418002: one requirement traverses the bar, the route draft and Save", async () => {
  const s = await scenario();
  await run(s);
  assert.equal(s.endpointRequests.length, 1);
  assert.equal(writesBeyondRecords(s).length, 0, "a draft alone writes nothing");
  const edit = all(draftBox(s), "textarea")[0];
  edit.value = edit.value.replace(candidate().rule, "Every loan displays a readable due date.");
  edit.dispatchEvent(new Event("input"));
  await save(s);
  assert.match(assertProposal(s, ACCOUNT_SOURCE), /Every loan displays a readable due date\./);
  assert.ok(messageLines(proposalWrites(s)[0]).every((line) => !line.includes(INSTRUCTION)), "no line of the commit names the instruction");
  // A message of the bar runs in the tab without a job record; the piece it hands on to change-requirements, run in this tab, has its own (UC-049 4a.1), which holds no word of it.
  assert.equal(recordTexts(s).length, 1, "one job record: the piece's");
  assert.ok(/^kind: change-requirements$/m.test(recordTexts(s)[0]) && /^route: tab$/m.test(recordTexts(s)[0]) && !recordTexts(s)[0].includes(INSTRUCTION), recordTexts(s)[0]);
});

// TST-418003
// level: system
// module: MOD-trace-pages; MOD-review-pages; MOD-prompt-bar; MOD-spec-changes
// guards: UC-019
// given: the group Lending of the specification browser, whose requirements display as A LOAN HAS A DUE DATE then A BOOK IS SHELVED, and a draft of the section Lending that changes both
// input: unfold the group, Send, press Review the draft (which keeps the draft in the tab), then the route draft at the subject the bar kept the draft for (TST-418007 is the address the bar writes), and Save
// expect: the message was prepared for the requirements [A LOAN HAS A DUE DATE, A BOOK IS SHELVED] in that order (the alphabetical order is the reverse); the draft shows the one drafted section holding both changes; one section is proposed with the loan's change before the shelf's and SPEC.md unchanged
test("TST-418003: an ordered group reaches the participant in its order and its draft is saved as one section", async () => {
  const s = await scenario({ answers: [draft(candidate(), candidate({ name: "A SHELF IS VISIBLE", replaces: SHELF, rule: "Every book displays its shelf.", check: "`tests/shelf.test.mjs`" }))] });
  await fromTrace(s, true);
  await send(s);
  assert.deepEqual(targetsOf(s), [LOAN, SHELF], "the participant was asked for the group in its display order, which is not the alphabetical one");
  await review(s);
  assert.equal(keptDraft(s).kind, "change-requirements");
  assert.deepEqual(keptDraft(s).params.requirements, [LOAN, SHELF]);
  await goTo(s, draftAddress(s, keptDraft(s).subject));
  assert.deepEqual(all(s.target, "div", "draft").map((node) => node.getAttribute("data-path")), ["## Lending"], "one drafted section");
  const shown = all(draftBox(s), "textarea")[0].value;
  assert.ok(shown.includes(`**${CHANGED}**`) && shown.includes("**A SHELF IS VISIBLE**"), "the section holds both changes");
  await save(s);
  const text = assertProposal(s, ACCOUNT_SOURCE);
  assert.match(text, /Every book displays its shelf\./);
  assert.ok(text.indexOf(`**${CHANGED}**`) < text.indexOf("**A SHELF IS VISIBLE**"));
});

// TST-418004
// level: system
// module: MOD-review-pages; MOD-prompt-bar; MOD-source-register
// guards: UC-019; THE PERSON WHO PROMPTS IS A SOURCE
// given: the author's register entry exists in the instance but the product does not link it
// input: the page of the requirement A LOAN HAS A DUE DATE, an instruction in the bar, Send, Review the draft and Save
// expect: the change runs all the same — the person's account github.com/akmaier is its source, which needs no register entry and no link (UC-019 step 6) —: the bar names no finding under
//   THE PERSON WHO PROMPTS IS A SOURCE, and the saved proposal names github.com/akmaier
test("TST-418004: without a linked register entry of the author the change runs, its source the author's account", async () => {
  const s = await scenario({ linked: false });
  await run(s);
  assert.doesNotMatch(statusOf(s).textContent, /THE PERSON WHO PROMPTS IS A SOURCE/);
  await save(s);
  assertProposal(s, ACCOUNT_SOURCE);
});

// TST-418005
// level: system
// module: MOD-review-pages; MOD-prompt-bar; MOD-job-runner; MOD-spec-changes
// guards: UC-019; A SPEC EDIT IS SAVED AS A PROPOSAL
// given: a draft of the section Lending that changes A LOAN HAS A DUE DATE and adds A DUE DATE MAY BE HIDDEN — the drafter's new text, with no class (UC-019 step 6)
// input: Send, Review the draft, Save
// expect: the page shows the one drafted section and offers no class to choose; the proposal holds the changed rule and "Every loan may hide its due date." under A DUE DATE MAY BE HIDDEN, as
//   drafted; SPEC.md unchanged; the endpoint was asked once
test("TST-418005: a draft that adds a requirement beside a change is shown and proposed as drafted, with no class to decide", async () => {
  const s = await scenario({ answers: [draft(candidate(), candidate({ name: CONFLICT, replaces: null, rule: "Every loan may hide its due date." }))] });
  await run(s);
  assert.equal(all(s.target, "div", "draft").length, 1);
  assert.equal(all(s.target, "select", "class").length, 0, "a prompted change has no class to choose");
  await save(s);
  const proposal = assertProposal(s, ACCOUNT_SOURCE);
  assert.match(proposal, /Every loan visibly displays its due date\./);
  assert.match(proposal, new RegExp(`\\*\\*${CONFLICT}\\*\\*[^\\n]*\\nEvery loan may hide its due date\\.`));
  assert.equal(s.endpointRequests.length, 1);
});

// TST-418006
// level: system
// module: MOD-review-pages; MOD-spec-changes
// guards: UC-019; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT
// given: an editable draft on the route draft, followed by a concurrent commit changing the section Lending of the SPEC
// input: Save (UC-019 9a)
// expect: no write; the author's edit is still in its field; the section as it stands now is beside it
test("TST-418006: a stale section refuses Save and retains the draft beside the newer text", async () => {
  const s = await scenario();
  await run(s);
  const edit = all(draftBox(s), "textarea")[0];
  edit.value = edit.value.replace(candidate().rule, "Every loan displays the author's retained edit.");
  edit.dispatchEvent(new Event("input"));
  const edited = edit.value;
  assert.ok(edited.includes("Every loan displays the author's retained edit."), "known positive: the edit is in the editor");
  await s.product.change("SPEC.md", SPEC.replace(CURRENT_RULE, "Every loan states its updated due date."));
  const before = writesBeyondRecords(s).length;
  await save(s);
  assert.equal(writesBeyondRecords(s).length, before);
  assert.equal(edit.value, edited);
  assert.ok(all(s.target, "div", "newer").some((node) => /Every loan states its updated due date\./.test(node.textContent)), "the newer section stands beside the draft");
});

// TST-418007
// level: system
// module: MOD-trace-pages; MOD-prompt-bar; MOD-review-pages
// guards: UC-019
// given: A LOAN HAS A DUE DATE open in the specification browser, a draft returned for it
// input: press Review the draft in the bar
// expect: the route draft shows the drafted section of that draft, as it does from the page of the requirement
test("TST-418007: Review the draft from the specification browser shows the draft", async () => {
  const s = await scenario();
  await fromTrace(s);
  await send(s);
  await review(s);
  assert.deepEqual(all(s.target, "div", "draft").map((node) => node.getAttribute("data-path")), ["## Lending"], s.target.textContent);
});

// TST-418008
// level: system
// module: MOD-trace-pages; MOD-prompt-bar; MOD-source-register
// guards: UC-019; THE PERSON WHO PROMPTS IS A SOURCE
// given: the author's register entry is not linked by the product, and A LOAN HAS A DUE DATE is open in the specification browser
// input: an instruction in the bar and Send
// expect: the message is sent and its hand-over runs, as from the page of the requirement (TST-418004): the endpoint is asked, and the bar names no finding under THE PERSON WHO PROMPTS IS A SOURCE
test("TST-418008: without a linked register entry of the author a send from the specification browser runs", async () => {
  const s = await scenario({ linked: false });
  await fromTrace(s);
  await send(s);
  assert.ok(s.endpointRequests.length > 0, statusOf(s).textContent);
  assert.doesNotMatch(statusOf(s).textContent, /THE PERSON WHO PROMPTS IS A SOURCE/);
});
