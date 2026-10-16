// System scenarios of UC-019 for a change of requirements, through the prompt bar and the review pages' route `draft` (ITM-514).
// Authored by Developer developer-sonnet-e, who implemented none of ITM-507 (the route `draft`), ITM-508 (the specification browser's
// subject) or ITM-551; it implemented no UC-019 production behaviour. The harness and the helpers below are used by
// tests/release-uc-019-change-requirements-by-prompt.test.mjs and tests/system-uc-019-change-by-prompt.test.mjs.
// Module: MOD-trace-pages; MOD-review-pages; MOD-site-frame; MOD-prompt-bar; MOD-spec-changes; MOD-source-register; MOD-runtimes; MOD-job-runner
// Guards: UC-019
// Level: system
// Run: node --test tests/system-uc-019-change-requirements-by-prompt.test.mjs
//
// The page is MOD-site-frame's real `startPage` on the review page, over the real views of MOD-trace-pages and MOD-review-pages, the real
// MOD-prompt-bar, MOD-job-runner, MOD-runtimes and the real GitHub host. GitHub (the instance and the product) and the drafting participant
// are the app-harness's servers, in memory; the global `fetch` is replaced by a function that answers them and records any request to another
// origin, which no test leaves: nothing reaches the network. The document is the one of tests/review-pages-draft-world.mjs, whose browser
// storage the scenario empties first. A person's actions are the clicks and the typing of the bar's and the pages' own controls.
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

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { byClass, buttonsNamed, click, find, until } from "./review-pages-draft-world.mjs";
import { repoServer, settle } from "./app-harness.mjs";
import { openStore, readTabValue, writeSetting } from "../src/browser-store/index.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";
import { view as tracePages } from "../src/trace-pages/index.mjs";
import { view as reviewPages } from "../src/review-pages/index.mjs";

const { startPage } = await import("../src/site-frame/index.mjs");

export const INSTANCE = "akmaier/agent-m", SOURCE = "SRC-author";
export const LOAN = "A LOAN HAS A DUE DATE", SHELF = "A BOOK IS SHELVED";
export const CHANGED = "A DUE DATE IS VISIBLE", CONFLICT = "A DUE DATE MAY BE HIDDEN";
export const INSTRUCTION = "Make the due date visible.";
export const CURRENT_RULE = "Every loan states its due date.";
const txt = (...lines) => `${lines.join("\n")}\n`;
export const SPEC = txt("# Lending tool", "", "## Lending", "", `**${LOAN}** *(SRC-policy)*`, CURRENT_RULE,
  "*Check:* `tests/loan.test.mjs`", "", `**${SHELF}** *(SRC-policy)*`, "Every book has a shelf.", "*Check:* `tests/shelf.test.mjs`", "");
const ROOT = new URL("../", import.meta.url);
export const readOriginal = (path) => readFileSync(new URL(path, ROOT), "utf8");
const PERSON = txt("---", `id: ${SOURCE}`, "title: Author", "kind: person", "identifier: github.com/akmaier", "authority: advisory",
  "licence: may be republished - fixture", "---", `# ${SOURCE} Author`, "", "## Versions", "",
  "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  "| `2026-10-13` | 2026-10-13 | fixture | this repository | one file, hashed only |");
const POLICY = PERSON.replaceAll(SOURCE, "SRC-policy").replace("kind: person", "kind: document")
  .replace("identifier: github.com/akmaier", "identifier: Lending policy").replace("authority: advisory", "authority: normative");
const LINKS = txt("# Sources", "", "| Source | Version | Hash | Part |", "|---|---|---|---|",
  `| ${SOURCE} | 2026-10-13 | ${"0".repeat(64)} | prompt |`, `| SRC-policy | 2026-10-13 | ${"0".repeat(64)} | lending |`);
const registerHead = readOriginal("docs/participants.md").split("\n");
const header = registerHead.slice(0, registerHead.findIndex((line) => line.startsWith("|---")) + 1).join("\n");
const register = (context) => txt(header,
  `| drafter | model endpoint | fixture-model | ${context} | - | draft text | this machine | endpoint fixture |`,
  "| observer | model endpoint | observer-model | 200000 | - | read repository | Anthropic, USA | endpoint fixture |",
  "| ci-drafter | CI agent | ci-model | 200000 | - | draft text | GitHub Actions in the USA | ci hosted secret CI_KEY |");

export const candidate = (fields = {}) => ({ name: CHANGED, rule: "Every loan visibly displays its due date.",
  check: "`tests/loan.test.mjs`", constrains: "product", passage: "make visible", class: "change", of: LOAN, ...fields });
export const draft = (...candidates) => ({ candidates: candidates.length ? candidates : [candidate()] });

// ---------------------------------------------------------------- the page and the servers

const FIXTURE_ORIGINS = ["https://api.github.com", "https://raw.githubusercontent.com", "https://fixture-endpoint.example.test", "http://127.0.0.1:9418"];
export const outside = [];
afterEach(() => { assert.deepEqual(outside.splice(0), [], "no request left the fixtures"); });

// The scenario's pages share the global document; the storage of the last one is emptied before the next opens.
function emptyStorage(storage) { while (storage.length > 0) storage.removeItem(storage.key(0)); }

/**
 * scenario({ owner, linked, answers, context, bridge, extraFiles, recording, hash }) -> the open page and its servers. The instance is akmaier/agent-m (its Pages
 * address is the location), the product `<owner>/lending-tool` with the SPEC above, the person's source linked unless `linked` is false, and the participant
 * `drafter` (draft text), `observer` (read the repository) and the CI agent `ci-drafter` (not offered by the bar). `answers` are the drafting endpoint's replies in
 * turn (a value, or a function of the requests so far); `hash` is the fragment the page opens at, none for the specification browser.
 */
export async function scenario({ owner = "akmaier", linked = true, answers = [draft()], context = 200000, bridge = false, extraFiles = {}, instanceFiles = {},
  recording = false, hash = null } = {}) {
  const repo = `${owner}/lending-tool`, address = `https://github.com/${repo}`, endpointRequests = [], bridgeRequests = [];
  let answerNumber = 0;
  const endpointAnswer = () => {
    const value = answers[Math.min(answerNumber++, answers.length - 1)];
    return typeof value === "function" ? value(endpointRequests, bridgeRequests) : value;
  };
  const answerText = () => {
    const value = endpointAnswer();
    return typeof value === "string" ? value : JSON.stringify(value && Object.hasOwn(value, "draft") ? value : { draft: value, answers: [] });
  };
  const response = (value) => new Response(JSON.stringify(value), { status: 200, headers: { "content-type": "application/json" } });
  const handler = async (url, init) => {
    if (url.origin === "https://fixture-endpoint.example.test") {
      endpointRequests.push({ url: url.href, body: JSON.parse(init.body), headers: init.headers });
      return response({ choices: [{ message: { content: answerText() } }], usage: { prompt_tokens: 10, completion_tokens: 5 } });
    }
    if (url.origin === "http://127.0.0.1:9418") {
      bridgeRequests.push({ url: url.href, method: init.method, body: init.body && JSON.parse(init.body), headers: init.headers });
      if (init.method === "POST" && url.pathname === "/v1/ask") return response({ ask: "fixture-ask" });
      if (init.method === "GET" && url.pathname === "/v1/ask/fixture-ask") return response({ state: "done", text: answerText(), usage: { inputTokens: 10, outputTokens: 5 }, error: null });
      return new Response(JSON.stringify({ error: "not-found" }), { status: 404 });
    }
    return null;
  };
  const product = await repoServer({ repo, files: { "README.md": "# Lending tool\n", "SPEC.md": SPEC,
    "docs/sources.md": linked ? LINKS : LINKS.split("\n").filter((line) => !line.startsWith(`| ${SOURCE} |`)).join("\n"),
    ".github/workflows/agent-m-jobs.yml": "name: Agent M jobs\n", ...extraFiles } });
  const chapterFolder = "docs/sources/SRC-vibe-coding/2026-10-05/";
  const chapters = Object.fromEntries(readdirSync(new URL(chapterFolder, ROOT)).filter((path) => path.endsWith(".md"))
    .map((path) => [chapterFolder + path, readOriginal(chapterFolder + path)]));
  const instance = await repoServer({ files: { "docs/participants.md": register(context), [`docs/sources/${SOURCE}.md`]: PERSON,
    "docs/sources/SRC-policy.md": POLICY, "docs/sources/SRC-vibe-coding.md": readOriginal("docs/sources/SRC-vibe-coding.md"),
    ...(recording ? { "docs/conversation-recording.md": txt("---", "recording: on", "---", "# Recording of conversations") } : {}),
    ...chapters, ...instanceFiles }, handlers: [handler, (url, init) => url.pathname === `/repos/${repo}`
      ? response({ default_branch: "main", private: false, archived: false, permissions: { push: true }, description: "" })
      : url.pathname.startsWith(`/repos/${repo}/`) ? product.fetch(url, init) : null] });
  globalThis.fetch = (input, init) => {
    const url = new URL(String(input));
    if (!FIXTURE_ORIGINS.includes(url.origin)) { outside.push(url.href); return Promise.reject(new TypeError(`the test's network refuses ${url.href}`)); }
    return instance.fetch(input, init);
  };
  // The browser: the window announces a change of the fragment, as a browser does, the storage is empty, the page's timers do not run.
  const events = new EventTarget();
  let fragment = "";
  const location = { hostname: "akmaier.github.io", host: "akmaier.github.io", protocol: "https:", pathname: "/agent-m/docs/index.html",
    get hash() { return fragment; }, set hash(value) { fragment = value; queueMicrotask(() => events.dispatchEvent(new Event("hashchange"))); } };
  Object.defineProperty(globalThis, "location", { configurable: true, value: location });
  Object.assign(globalThis.window, { addEventListener: events.addEventListener.bind(events), dispatchEvent: events.dispatchEvent.bind(events) });
  globalThis.setInterval = () => 1;
  emptyStorage(globalThis.localStorage);
  emptyStorage(globalThis.sessionStorage);
  const store = openStore(INSTANCE);
  writeSetting(store, "github-token", { value: "github_pat_FIXTURE_INSTANCE_0123456789", name: "github.com/akmaier", expires: "2027-01-01" });
  writeSetting(store, `github-token:${repo}`, { value: "github_pat_FIXTURE0123456789", name: "github.com/akmaier", expires: "2027-01-01" });
  writeSetting(store, "products", [address]);
  writeSetting(store, "endpoint:fixture", { url: "https://fixture-endpoint.example.test/v1", kind: "openai-compatible", model: "fixture-model", ...(bridge ? { bridge: "release-bridge" } : {}) });
  if (bridge) writeSetting(store, "bridge:release-bridge", { address: "http://127.0.0.1:9418", token: "fixture-pairing-token" });
  const named = encodeURIComponent(address);
  fragment = hash ?? `#trace/key=specification/ref=main/product=${named}`;
  const s = { product, instance, repo, address, store, location, endpointRequests, bridgeRequests, chapter: readOriginal(`${chapterFolder}08_requirements-engineering.md`) };
  await startPage({ page: "review", views: [tracePages, reviewPages], menuViews: [] });
  await rest(s);
  s.body = document.body;
  s.target = find(document.body, (node) => node.localName === "main")[0];
  s.footer = find(document.body, (node) => node.localName === "footer")[0];
  await until(() => byClass(s.footer, "section", "prompt-bar").length === 1, "the prompt bar is drawn");
  return s;
}

// The composition root registers the strategies of the views once, as src/site-frame/start.mjs does for the page's views.
for (const [slug, view] of [["trace-pages", tracePages], ["review-pages", reviewPages]]) for (const strategies of view.strategies ?? []) registerStrategies(slug, strategies);

// Until the servers have had nothing in flight for a while.
export async function rest(s) { await settle(s.instance); }
// The page goes to a fragment, as a person's link or the bar's navigation does, and the route is drawn.
export async function goTo(s, fragment) {
  s.location.hash = fragment;
  await rest(s);
}

export const all = (root, tag, className = null) => find(root, (node) => (!tag || node.localName === tag) && (!className || node.className.split(/\s+/).includes(className)));
export const one = (root, tag, className) => { const nodes = all(root, tag, className); assert.equal(nodes.length, 1, `one ${tag}.${className}: ${root?.textContent ?? ""}`); return nodes[0]; };
export const namedButton = (root, text) => { const found = buttonsNamed(root, text); assert.ok(found.length > 0, `${text} is offered: ${root.textContent}`); return found[0]; };
export const row = (s, name = CHANGED) => { const found = all(s.target, "li", "candidate").find((node) => node.getAttribute("data-name") === name); assert.ok(found, `candidate ${name} is shown: ${s.target.textContent}`); return found; };
export const proposalWrites = (s) => s.product.writes.filter((write) => Object.keys(write.files).some((path) => path.endsWith(".begruendung.md")));
export const proposalTexts = (s) => proposalWrites(s).flatMap((write) => Object.entries(write.files).filter(([path]) => /\/\d\d-[^/]+\.md$/.test(path) && !path.endsWith(".begruendung.md")).map(([, text]) => text));
export const recordTexts = (s) => Object.entries(s.product.files).filter(([path]) => /^docs\/jobs\/JOB-.*\.md$/.test(path)).map(([, text]) => text);
export const conversationRecords = (s) => Object.entries(s.instance.files).concat(Object.entries(s.product.files)).filter(([path]) => path.startsWith("docs/conversations/"));

// ---------------------------------------------------------------- the person's actions

export const barOf = (s) => one(s.footer, "section", "prompt-bar");
export const statusOf = (s) => one(barOf(s), "section", "status");
// A person clicks (the page's controls listen for a click), and the servers settle.
export async function press(s, node) {
  assert.ok(node, "nothing to click");
  assert.ok(!node.disabled, `disabled — a person cannot click ${node.textContent}`);
  click(node);
  await rest(s);
}
// The specification browser, as the frame draws it for the product, with the section "Lending" unfolded and, unless `group`, A LOAN HAS A DUE DATE opened.
export async function fromTrace(s, group = false) {
  await press(s, one(s.target, "button", "spec-section-toggle"));
  if (!group) await press(s, all(s.target, "button", "requirement-name").find((button) => button.textContent === LOAN));
}
// The review pages' page of the requirement LOAN (the route `requirement`), where the bar's subject names the requirement and the route `draft`.
export async function onRequirementPage(s, name = LOAN) {
  await goTo(s, `#requirement/name=${encodeURIComponent(name)}/product=${encodeURIComponent(s.address)}`);
  await until(() => all(s.target, "textarea").length > 0, "the requirement's page");
}
// The person writes `text` in the bar, chooses `participant` where the bar offers several, and presses Send; resolves once the bar is free again.
export async function send(s, text = INSTRUCTION, { participant = null } = {}) {
  const bar = barOf(s);
  if (participant !== null) {
    const selector = all(bar, "select", "participant")[0];
    assert.ok(selector, "the bar offers several participants");
    selector.value = participant;
  }
  one(bar, "textarea", "instruction").value = text;
  const sent = one(bar, "button", "send");
  click(sent);
  await rest(s);
  await until(() => sent.disabled === false, "the message has run");
  await rest(s);
}
// "Review the draft": the bar writes the address of the draft route; the page draws it. -> the fragment.
export async function review(s) {
  await press(s, one(barOf(s), "button", "review"));
  await rest(s);
  return s.location.hash;
}
export const save = (s) => press(s, namedButton(s.target, "Save"));
// The whole path of a draft of requirements from the requirement's page: the bar, Send, Review the draft; the draft is on the page.
export async function run(s, options = {}) {
  await onRequirementPage(s);
  await send(s, options.instruction ?? INSTRUCTION, options);
  await review(s);
  await until(() => all(s.target, "section", "requirements-result").length === 1, `the draft of the requirements: ${s.target.textContent}`);
}

export function assertProposal(s) {
  assert.equal(s.product.files["SPEC.md"], SPEC, "SPEC stays byte-identical before acceptance");
  assert.equal(proposalWrites(s).length, 1, "one Save produces one proposal commit for the affected section");
  const text = proposalTexts(s).join("\n");
  assert.match(text, /SRC-author, make visible/, "the prompting source reaches the saved proposal");
  assert.ok(!Object.keys(s.product.files).some((path) => path.startsWith("docs/approvals/")), "the generated proposal carries no acceptance");
  return text;
}

// Two use cases in their five parts, UC-007 realising LOAN and UC-008 realising SHELF, to add to the product (`extraFiles: useCases`), a draft that adds an alternative flow
// 2b to one of them, and the page of a use case.
const useCase = (id, title, realises, alternative = "- **2a. The book is out.** Agent M says so.") => txt("---", `id: ${id}`, `title: ${title}`, "area: lending", "actors:", "  - Author",
  "realises:", ...realises.map((name) => `  - ${name}`), "---", `# ${id} ${title}`, "", `**Goal.** ${title}.`, "", "## Actors", "", "- **Author**", "", "## Precondition", "",
  "- The product is managed.", "", "## Main flow", "", "1. The author starts.", "2. Agent M answers.", "", "## Alternative flows", "", alternative, "", "## Postcondition", "",
  "- Nothing is written.");
export const UC7_PATH = "docs/use-cases/UC-007-derive-use-cases.md", UC8_PATH = "docs/use-cases/UC-008-review-use-cases.md";
export const UC7 = useCase("UC-007", "Derive use cases", [LOAN]), UC8 = useCase("UC-008", "Review use cases", [SHELF]);
export const useCases = { [UC7_PATH]: UC7, [UC8_PATH]: UC8 };
const NEW_FLOW = "- **2a. The book is out.** Agent M says so.\n- **2b. The service fails.** Agent M reports the error and writes nothing.";
export const changed = (id, path, base) => ({ path, class: "change", of: id, text: base.replace(/- \*\*2a\..*$/m, NEW_FLOW) });
export async function onUseCase(s, id = "UC-007") {
  await goTo(s, `#use-case/id=${id}/product=${encodeURIComponent(s.address)}`);
}
// What the participant was sent from the heading "The use case, the requirements it realises, and every other use case" on: the target first, then the requirements it
// realises, then the other use cases.
export const useCaseSection = (s, at = 0) => sentText(s, at).split("## The use case, the requirements it realises, and every other use case")[1] ?? "";

// The text the participant was sent in its n-th request, and the requirements that request names to change: the headings under "The requirements to change".
export const sentText = (s, at = 0) => s.endpointRequests[at].body.messages.map((message) => message.content).join("\n");
export const targetsOf = (s, at = 0) => {
  const from = sentText(s, at).split("## The requirements to change, each with its whole section")[1] ?? "";
  return [...from.split("\n## Every requirement of the product")[0].matchAll(/^### (.+)$/gm)].map((match) => match[1]);
};
// The draft the bar keeps in the tab for the page's subject, the address of the route `draft` for a subject's key, and the lines of a commit message.
export const keptDraft = (s) => readTabValue(s.store, "prompt-bar:draft");
export const draftAddress = (s, key) => `#draft/subject=${encodeURIComponent(key)}/product=${encodeURIComponent(s.address)}`;
export const messageLines = (write) => write.message.split("\n");

if (process.argv.includes(fileURLToPath(import.meta.url))) {
  // TST-418001
  // level: system
  // module: MOD-trace-pages; MOD-site-frame; MOD-prompt-bar
  // guards: UC-019 (steps 1 to 3); THE PAGE NAMES WHERE IT SENDS
  // given: the specification browser of the product at its default branch, the register offering drafter (this machine) and observer (Anthropic, USA)
  // input: unfold Lending, open A LOAN HAS A DUE DATE without naming it in the bar, write the instruction in the bar and press Send with the participant drafter
  // expect: before Send the bar names both participants with their places and nothing has been sent; after it the one request to the endpoint holds the instruction and names exactly A LOAN HAS A DUE DATE under "The requirements to change"
  test("TST-418001: the prompt bar on the specification browser names where it sends and takes the open requirement as the target", async () => {
    const s = await scenario();
    const bar = barOf(s);
    assert.deepEqual(all(bar, "option").map((option) => option.textContent), ["drafter — this machine", "observer — Anthropic, USA"]);
    await fromTrace(s);
    assert.equal(s.endpointRequests.length, 0, "nothing is sent while a requirement is only open");
    await send(s, INSTRUCTION, { participant: "drafter" });
    assert.equal(s.endpointRequests.length, 1);
    assert.ok(sentText(s).includes(INSTRUCTION), "the instruction reaches the participant");
    assert.deepEqual(targetsOf(s), [LOAN], "the requirement to change is the open one, not named by the author");
    assert.equal(s.product.writes.length, 0);
  });

  // TST-418002
  // level: system
  // module: MOD-review-pages; MOD-site-frame; MOD-prompt-bar; MOD-job-runner; MOD-spec-changes; MOD-source-register
  // guards: UC-019 (steps 3 to 9)
  // given: the page of the requirement A LOAN HAS A DUE DATE, its author's source linked, and a fixture endpoint that drafts one changed requirement
  // input: the instruction in the bar, Send, Review the draft, edit the returned rule, Save
  // expect: one request to the endpoint; before Save nothing is written; after it one commit with the author's exact edit as one open proposal, SPEC.md unchanged, the commit message without the instruction, and no job record
  test("TST-418002: one requirement traverses the bar, the route draft and Save", async () => {
    const s = await scenario();
    await run(s);
    assert.equal(s.endpointRequests.length, 1);
    assert.equal(s.product.writes.length, 0, "a draft alone writes nothing");
    const edit = one(row(s), "textarea", "candidate-rule");
    edit.value = "Every loan displays a readable due date.";
    edit.dispatchEvent(new Event("input"));
    await save(s);
    assert.match(assertProposal(s), /Every loan displays a readable due date\./);
    assert.ok(messageLines(proposalWrites(s)[0]).every((line) => !line.includes(INSTRUCTION)), "no line of the commit names the instruction");
    assert.equal(recordTexts(s).length, 0, "a message of the bar runs in the tab without a job record");
  });

  // TST-418003
  // level: system
  // module: MOD-trace-pages; MOD-review-pages; MOD-prompt-bar; MOD-spec-changes
  // guards: UC-019 (steps 1, 3, 8, 9)
  // given: the group Lending of the specification browser, whose requirements display as A LOAN HAS A DUE DATE then A BOOK IS SHELVED, and two changed candidates
  // input: unfold the group, Send, press Review the draft (which keeps the draft in the tab), then the route draft at the subject the bar kept the draft for (TST-418007 is the address the bar writes), and Save
  // expect: the message was prepared for the requirements [A LOAN HAS A DUE DATE, A BOOK IS SHELVED] in that order (the alphabetical order is the reverse); the draft shows both candidates; one section is proposed with the loan before the shelf and SPEC.md unchanged
  test("TST-418003: an ordered group reaches the participant in its order and its draft is saved as one section", async () => {
    const s = await scenario({ answers: [draft(candidate(), candidate({ name: "A SHELF IS VISIBLE", of: SHELF, rule: "Every book displays its shelf." }))] });
    await fromTrace(s, true);
    await send(s);
    assert.deepEqual(targetsOf(s), [LOAN, SHELF], "the participant was asked for the group in its display order, which is not the alphabetical one");
    await review(s);
    assert.equal(keptDraft(s).kind, "change-requirements");
    assert.deepEqual(keptDraft(s).params.requirements, [LOAN, SHELF]);
    await goTo(s, draftAddress(s, keptDraft(s).subject));
    assert.equal(all(s.target, "li", "candidate").length, 2);
    await save(s);
    const text = assertProposal(s);
    assert.match(text, /Every book displays its shelf\./);
    assert.ok(text.indexOf(`**${LOAN}**`) < text.indexOf(`**${SHELF}**`));
  });

  // TST-418004
  // level: system
  // module: MOD-review-pages; MOD-prompt-bar; MOD-source-register
  // guards: UC-019 (4b); THE PERSON WHO PROMPTS IS A SOURCE
  // given: the author's source exists in the instance but the product does not link it
  // input: the page of the requirement A LOAN HAS A DUE DATE, an instruction in the bar and Send
  // expect: nothing is sent and nothing is written; the bar says "Nothing was sent." and names the two steps, registering the person (#library) and linking the source to the product (#sources); the bar offers no link, the steps are text
  test("TST-418004: a missing personal source stops before a send and names the steps", async () => {
    const s = await scenario({ linked: false });
    await onRequirementPage(s);
    await send(s);
    const said = statusOf(s).textContent;
    assert.match(said, /^Nothing was sent\./);
    assert.ok(said.includes("#library") && said.includes("#sources"), said);
    assert.equal(all(statusOf(s), "a").length, 0, "the steps are named in text, not offered as links");
    assert.equal(s.endpointRequests.length, 0);
    assert.equal(s.product.writes.length, 0);
  });

  // TST-418005
  // level: system
  // module: MOD-review-pages; MOD-prompt-bar; MOD-job-runner; MOD-spec-changes
  // guards: UC-019 (8a); A CONFLICT IS DECIDED BY A PERSON
  // given: a draft of a changed A LOAN HAS A DUE DATE and a candidate THE DUE DATE MAY BE HIDDEN that the participant classes as a conflict with it
  // input: Send, Review the draft, Save with the conflict undecided; in a second page the same draft with the class of the conflict set to new before Save
  // expect: undecided: the proposal holds the changed rule and not "Every loan may hide its due date.", and the conflict stays in the draft, undecided; decided: the proposal holds that rule under THE DUE DATE MAY BE HIDDEN; the endpoint was asked once in each
  test("TST-418005: an unresolved conflict stays out of the proposal until its author decides", async () => {
    const answers = [draft(candidate(), candidate({ name: CONFLICT, class: "conflict", rule: "Every loan may hide its due date." }))];
    const undecided = await scenario({ answers });
    await run(undecided);
    assert.equal(one(row(undecided, CONFLICT), "select", "class").value, "conflict");
    await save(undecided);
    const proposal = assertProposal(undecided);
    assert.match(proposal, /Every loan visibly displays its due date\./);
    assert.ok(!proposal.includes("Every loan may hide its due date."), "the undecided conflict is not in the proposal");
    assert.equal(all(undecided.target, "li", "candidate").length, 2, "the conflict stays in the draft");
    assert.equal(undecided.endpointRequests.length, 1);

    const decided = await scenario({ answers });
    await run(decided);
    const choice = one(row(decided, CONFLICT), "select", "class");
    choice.value = "new";
    choice.dispatchEvent(new Event("change"));
    await save(decided);
    const decidedProposal = assertProposal(decided);
    assert.match(decidedProposal, new RegExp(`\\*\\*${CONFLICT}\\*\\*`));
    assert.match(decidedProposal, /Every loan may hide its due date\./);
    assert.equal(decided.endpointRequests.length, 1);
  });

  // TST-418006
  // level: system
  // module: MOD-review-pages; MOD-spec-changes
  // guards: UC-019 (9a); A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT
  // given: an editable draft on the route draft, followed by a concurrent commit changing the section Lending of the SPEC
  // input: Save (UC-019 9a)
  // expect: no write; the author's edit is still in its field; the section as it stands now is beside it
  test("TST-418006: a stale section refuses Save and retains the draft beside the newer text", async () => {
    const s = await scenario();
    await run(s);
    const edit = one(row(s), "textarea", "candidate-rule");
    edit.value = "Every loan displays the author's retained edit.";
    edit.dispatchEvent(new Event("input"));
    await s.product.change("SPEC.md", SPEC.replace(CURRENT_RULE, "Every loan states its updated due date."));
    const before = s.product.writes.length;
    await save(s);
    assert.equal(s.product.writes.length, before);
    assert.equal(edit.value, "Every loan displays the author's retained edit.");
    assert.match(one(s.target, "div", "newer").textContent, /Every loan states its updated due date\./);
  });

  // TST-418007
  // level: system
  // module: MOD-trace-pages; MOD-prompt-bar; MOD-review-pages
  // guards: UC-019 (steps 1, 8)
  // given: A LOAN HAS A DUE DATE open in the specification browser, a draft returned for it
  // input: press Review the draft in the bar
  // expect: the route draft shows the candidates of that draft, as it does from the page of the requirement
  test("TST-418007: Review the draft from the specification browser shows the draft", async () => {
    const s = await scenario();
    await fromTrace(s);
    await send(s);
    await review(s);
    assert.equal(all(s.target, "li", "candidate").length, 1, s.target.textContent);
  });

  // TST-418008
  // level: system
  // module: MOD-trace-pages; MOD-prompt-bar; MOD-source-register
  // guards: UC-019 (4b); THE PERSON WHO PROMPTS IS A SOURCE
  // given: the author's source is not linked by the product, and A LOAN HAS A DUE DATE is open in the specification browser
  // input: an instruction in the bar and Send
  // expect: nothing is sent, as from the page of the requirement (TST-418004)
  test("TST-418008: a missing personal source stops a send from the specification browser", async () => {
    const s = await scenario({ linked: false });
    await fromTrace(s);
    await send(s);
    assert.equal(s.endpointRequests.length, 0, statusOf(s).textContent);
  });
}
