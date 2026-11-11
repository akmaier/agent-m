// The live review pages (src/site-frame/dashboard-app.mjs) draw the route the prompt bar goes to also when the tab already shows it. The bar's *Review the draft* keeps the new
// ConversationDraft in the tab and goes to the subject's `draftRoute` (MOD-prompt-bar); on the route `draft` of the same conversation that route is the fragment shown, a browser fires
// no `hashchange` for a fragment that does not change, and the page went on showing the earlier draft while the tab held the new one — its Save would have written the earlier one.
// Run: node --test tests/site-frame-dashboard-review-draft-again.test.mjs
//
// Module: MOD-site-frame
// Guards: UC-049; A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT
// Level: unit
//
// The real dashboard, the real MOD-prompt-bar, MOD-job-runner and MOD-review-pages run in tests/app-harness.mjs against its fake GitHub; the endpoint ep1 is a handler of that fake,
// which answers each message with the next draft of ANSWERS. The harness's location is a plain object: writing its hash fires nothing, as a browser fires no `hashchange` for the
// fragment it already shows (a changed fragment is announced by the harness's page.go). The tab's sessionStorage is a map of this file. Each test states its input and expected result
// in its own text; none reads one from the SPEC, a use case or an architecture file.

import assert from "node:assert/strict";
import test from "node:test";
import { REPO, openDashboard, repoServer, setting, settle } from "./app-harness.mjs";

const SUBJECT = "use-case/id=UC-001";
const DRAFT_HASH = `#draft/subject=${encodeURIComponent(SUBJECT)}`;
// The key under which this tab keeps the conversation's draft (MOD-browser-store's prefix of the instance REPO, MOD-prompt-bar's `prompt-bar:draft`).
const DRAFT_KEY = `agent-m:${REPO}:prompt-bar:draft`;
const FILES = {
  "README.md": "# Fixture\n",
  "docs/participants.md": "# Participants of this instance\n\n| Name | Type | Model |\n|---|---|---|\n| checker-a | agent | model-a |\n",
  "docs/earlier.md": "# Earlier\n",
  "docs/newer.md": "# Newer\n",
};
// The connection this browser keeps: the endpoint ep1, which drafts text at "this machine" from this tab (MOD-browser-store, endpoint:<name>).
const EP1 = setting("endpoint:ep1", { url: "https://ep1.example.test/v1", kind: "openai-compatible", model: "model-a", key: "sk-fixture-endpoint-key", place: "this machine", context: 200000 });
const draftOf = (answer, path) => ({ answer, edits: [{ path, text: `# ${answer}\n` }] });
const resultOf = (draft) => ({ draft, rounds: [{ number: 1 }], remaining: [], forPerson: [], stoppedBecause: "passed", raw: JSON.stringify({ draft }) });

// The model endpoint: each message is answered with the next draft of `answers`.
function endpoint(answers) {
  const asked = [];
  const handle = async (url, init) => {
    if (url.origin !== "https://ep1.example.test") return null;
    asked.push(init);
    const draft = answers[asked.length - 1] ?? answers.at(-1);
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ draft, answers: [] }) } }], usage: { prompt_tokens: 10, completion_tokens: 5 } }),
      { status: 200, headers: { "content-type": "application/json" } });
  };
  return { handle, asked };
}

// This tab's sessionStorage, holding `entries` — the conversation's draft under MOD-browser-store's key of the instance REPO, as writeTabValue keeps it.
function tabStorage(entries = {}) {
  const kept = new Map(Object.entries(entries));
  return { getItem: (key) => (kept.has(key) ? kept.get(key) : null), setItem: (key, value) => kept.set(key, String(value)), removeItem: (key) => kept.delete(key) };
}

const walk = (node) => (node?.children ?? []).flatMap((child) => (typeof child === "string" ? [] : [child, ...walk(child)]));
const byClass = (root, name) => walk(root).filter((node) => String(node.className ?? "").split(/\s+/).includes(name));
const barOf = () => walk(globalThis.document.body).find((node) => node.localName === "footer" && node.className === "site-frame-prompt-bar");

// The person writes `text` in the bar and presses Send; resolves once the bar shows *Review the draft* for the answer.
async function sendFromBar(server, text) {
  const bar = barOf();
  assert.ok(bar, "the page has the prompt bar's footer");
  for (let at = 0; at < 200 && byClass(bar, "send").length === 0; at += 1) await settle(server);
  byClass(bar, "instruction")[0].value = text;
  await byClass(bar, "send")[0].fire("click", { isTrusted: true });
  for (let at = 0; at < 200 && byClass(bar, "review").length === 0; at += 1) await settle(server);
  assert.equal(byClass(bar, "review").length, 1, `the bar offers Review the draft: ${bar.textContent}`);
  return byClass(bar, "review")[0];
}

// TST-2026111505 · level: unit · module: MOD-site-frame
// guards: UC-049; A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT
// given: the tab keeps the conversation's draft "earlier draft" (an edit of docs/earlier.md) for the subject use-case/id=UC-001; the endpoint ep1 answers the next message with the draft
//   "newer draft" (an edit of docs/newer.md)
// input: the review pages at #draft/subject=use-case%2Fid%3DUC-001; the person sends "follow up" from the bar and presses Review the draft, whose route is the fragment shown
// expect: known positive: before the follow-up the page shows "earlier draft" and docs/earlier.md; after Review the draft the fragment is still #draft/subject=use-case%2Fid%3DUC-001 and the
//   page shows "newer draft" with docs/newer.md, and neither "earlier draft" nor docs/earlier.md
// counter-proof: on the code before, the bar's go only wrote location.hash, which fires no hashchange for the fragment shown, and the page kept "earlier draft" (red)
test("TST-2026111505 Review the draft on the draft route already shown draws the route again with the tab's newer draft", async () => {
  const earlier = { subject: SUBJECT, kind: "converse", participant: "ep1", params: {}, result: resultOf(draftOf("earlier draft", "docs/earlier.md")) };
  Object.defineProperty(globalThis, "sessionStorage", { value: tabStorage({ [DRAFT_KEY]: JSON.stringify(earlier) }), configurable: true, writable: true });
  const model = endpoint([draftOf("newer draft", "docs/newer.md")]);
  const server = await repoServer({ files: FILES, handlers: [model.handle] });
  const page = await openDashboard({ server, hash: DRAFT_HASH, entries: EP1 });
  assert.match(page.main(), /earlier draft/, "known positive: the earlier draft is shown");
  assert.match(page.main(), /docs\/earlier\.md/);

  const review = await sendFromBar(server, "follow up");
  assert.equal(model.asked.length, 1, "the follow-up reached the endpoint");
  await review.fire("click", { isTrusted: true });
  await settle(server);
  assert.equal(JSON.parse(globalThis.sessionStorage.getItem(DRAFT_KEY)).result.draft.answer, "newer draft", "known positive: the tab keeps the newer draft");
  assert.equal(globalThis.location.hash, DRAFT_HASH, "the fragment did not change");
  assert.match(page.main(), /newer draft/);
  assert.match(page.main(), /docs\/newer\.md/);
  assert.doesNotMatch(page.main(), /earlier draft|docs\/earlier\.md/);
});
