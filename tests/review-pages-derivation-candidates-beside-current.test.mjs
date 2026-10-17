// MOD-review-pages' panel of a derivation of requirements shows each candidate beside the current text of the requirement it refers to, marks a candidate that constrains the
// process, and says so when every candidate is a duplicate (ITM-577). UC-005 step 7: "each beside the existing requirement it refers to"; alternative flow 5b: "It is marked as such";
// alternative flow 7b: "Every candidate is a duplicate. The panel says so; writing then only adds sources to existing requirements."
// Run: node --test tests/review-pages-derivation-candidates-beside-current.test.mjs
//
// Module: MOD-review-pages
// Guards: UC-005; NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT; A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT
// Level: unit
//
// The panel is reached the way a person reaches it: the route spec-entry/draft, a participant, Run, and the endpoint's answer — a real job's draft, run in the tab. This imports the
// browser harness of tests/review-pages-harness.mjs unchanged. The product and the instance are in-memory hosts that keep to MOD-repository-hosts' interface; the source register and the
// source file are fixtures whose hashes the real MOD-source-register recipes check; the model endpoint is a fixture behind global fetch, so nothing reaches the network. Each test states its
// input and its expected result before it runs (given / input / expect), and the texts it expects are written out here, taken from no document.

import "./review-pages-harness.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const { openStore, writeSetting } = await import("../src/browser-store/index.mjs");
const { registerStrategies } = await import("../src/job-runner/index.mjs");
const pages = await import("../src/review-pages/index.mjs").catch((error) => ({ error }));
const route = pages.view?.routes.find((candidate) => candidate.name === "spec-entry");
(pages.view?.strategies ?? []).forEach((strategies, at) => registerStrategies(`tests/review-pages-derivation-candidates-beside-current.test.mjs#${at}`, strategies));

// ---------------------------------------------------------------- fixtures

const text = (...lines) => `${lines.join("\n")}\n`;
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const sha256Of = (body) => createHash("sha256").update(body).digest("hex");
const failure = (name, message) => Object.assign(new Error(message), { name });

const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/thesis-tool", web: "https://github.com/alice/thesis-tool" };
const TOKEN = { value: "github_pat_ALICEthesisTOOL0123456789abcdef", name: "Agent M - thesis-tool", expires: "2027-01-01" };
const LOAN = "A LOAN HAS A DUE DATE", SHELF = "A BOOK IS SHELVED";
const LOAN_RULE = "Every loan states the date by which the book is returned.", SHELF_RULE = "Every book stands on a shelf.";
const SPEC = text("# Thesis tool - Specification", "", "## Lending", "", `**${LOAN}** *(SRC-policy, ch. 1)*`, LOAN_RULE, "*Check:* `tests/loan.test.mjs`", "",
  `**${SHELF}** *(SRC-policy, ch. 1)*`, SHELF_RULE, "*Check:* `tests/shelf.test.mjs`");

const SOURCE = "SRC-policy", MAIN_FILE = "main.md";
const MAIN_TEXT = text("# Policy", "", "Chapter 1: loans state their due date.");
const MAIN_SHA = sha256Of(MAIN_TEXT);
const VERSION_HASH = sha256Of(`${MAIN_SHA}  ${MAIN_FILE}\n`);
const LINKS = text("# Requirement sources of the thesis tool", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", `| ${SOURCE} | 2026-10-01 | ${VERSION_HASH} | Chapter 1 |`);
const SOURCE_ENTRY = text("---", `id: ${SOURCE}`, "title: Library Policy", "kind: document", "authority: normative", "licence: may be republished - fixture", "---",
  `# ${SOURCE} Library Policy`, "", "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  `| 2026-10-01 | 2026-10-01 | fixture | fixture | 1 file, listed below; version hash \`${VERSION_HASH}\` |`, "",
  "### Files of 2026-10-01", "", "| File | SHA-256 |", "|---|---|", `| \`${MAIN_FILE}\` | \`${MAIN_SHA}\` |`, "", "## Parts", "", "- Chapter 1");

const PRODUCT_FILES = { "README.md": "# Thesis tool\n", "SPEC.md": SPEC, "docs/sources.md": LINKS };
const SOURCE_FILES = { [`docs/sources/${SOURCE}.md`]: SOURCE_ENTRY, [`docs/sources/${SOURCE}/2026-10-01/${MAIN_FILE}`]: MAIN_TEXT };

// ---------------------------------------------------------------- hosts

// A commit lands on the head that was read, else `Moved`: starting a job writes its record.
function fakeProduct() {
  const commits = new Map();
  let made = 0, head = null;
  const commitOf = (tree) => {
    const sha = createHash("sha1").update(`commit ${++made}`).digest("hex");
    commits.set(sha, tree);
    return sha;
  };
  head = commitOf(new Map(Object.entries(PRODUCT_FILES)));
  const snapshotAt = (sha, ref) => {
    const tree = commits.get(sha);
    return { repository: ON_GITHUB, ref, commit: sha, paths: [...tree.keys()].sort(), read: async (path) => (tree.has(path) ? tree.get(path) : null),
      blob: (path) => (tree.has(path) ? blobOf(tree.get(path)) : null) };
  };
  return { host: {
    async repositoryInfo() { return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" }; },
    async readSnapshot(ref) {
      if (ref === "trunk") return snapshotAt(head, "trunk");
      if (commits.has(ref)) return snapshotAt(ref, ref);
      throw failure("NotFound", `${ref} was not found`);
    },
    async readHistory() { return []; },
    async commitFiles(change) {
      if (change.branch !== "trunk" || change.expectedHead !== head) throw failure("Moved", "the branch moved");
      head = commitOf(new Map([...commits.get(head), ...change.files.map((file) => [file.path, file.text])]));
      return { commit: head, url: `${ON_GITHUB.web}/commit/${head}` };
    },
  } };
}

const ROOT = new URL("../", import.meta.url);
const onDisk = (path) => { try { return readFileSync(new URL(path, ROOT), "utf8"); } catch { return null; } };
const REGISTER_HEAD = onDisk("docs/participants.md").split("\n").filter((line, at, all) => at <= all.findIndex((each) => each.startsWith("|---"))).join("\n");
const REGISTER = `${REGISTER_HEAD}\n| drafter-a | model endpoint | model-a | 200000 | - | draft text | this machine | endpoint ep1 |\n`;

function fakeInstance() {
  const snapshot = { repository: { server: "github", origin: "https://github.com", path: "alice/agent-m", web: "https://github.com/alice/agent-m" },
    ref: "main", commit: "abc123def4567890abc123def4567890abc123de", paths: Object.keys(SOURCE_FILES).sort(),
    read: async (path) => (path === "docs/participants.md" ? REGISTER : path in SOURCE_FILES ? SOURCE_FILES[path] : onDisk(path)), blob: () => null };
  return { async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: false, archived: false, description: "" }; },
    async readSnapshot() { return snapshot; } };
}

// ---------------------------------------------------------------- the endpoint's answer

const candidate = (name, fields = {}) => ({ name, rule: `${name.toLowerCase()} rule.`, check: "`tests/fixture.test.mjs`", constrains: "product", passage: "ch. 1", class: "new", source: SOURCE, ...fields });
const CHANGE = "THE DUE DATE IS SHOWN", DUPLICATE = "A BOOK STANDS ON A SHELF", GATE = "A LOAN GATE DECISION IS RECORDED", FIRST_DUPLICATE = "EVERY LOAN STATES ITS RETURN DATE";
const MIXED = { candidates: [candidate(CHANGE, { class: "change", of: LOAN }), candidate(DUPLICATE, { class: "duplicate", of: SHELF, rule: SHELF_RULE })] };
const GATES = { candidates: [candidate(GATE, { constrains: "process" }), candidate(CHANGE, { class: "change", of: LOAN })] };
const ONLY_DUPLICATES = { candidates: [candidate(FIRST_DUPLICATE, { class: "duplicate", of: LOAN, rule: LOAN_RULE }), candidate(DUPLICATE, { class: "duplicate", of: SHELF, rule: SHELF_RULE })] };

let requests = [];
const realFetch = globalThis.fetch;
function endpointAnswers(draft) {
  requests = [];
  globalThis.fetch = async (url) => {
    requests.push(String(url));
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ draft, answers: [] }) } }], usage: { prompt_tokens: 10, completion_tokens: 5 } }),
      { status: 200, headers: { "content-type": "application/json" } });
  };
}
test.afterEach(() => { globalThis.fetch = realFetch; });

// ---------------------------------------------------------------- the page

function find(root, match) {
  const found = [];
  (function walk(node) { for (const kid of node.childNodes) { if (kid.nodeType === 1) { if (match(kid)) found.push(kid); walk(kid); } } })(root);
  return found;
}
const byClass = (root, name, className) => find(root, (node) => node.localName === name && node.className.split(" ").includes(className));
const click = (node) => node.dispatchEvent(new Event("click"));
async function until(condition, what) {
  const limit = Date.now() + 2000;
  while (Date.now() < limit) {
    if (condition()) return;
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.fail(`waited for ${what}`);
}

// The panel of the derivation's draft, reached by a real job: the route, the participant, Show the run panel, Run.
async function panelOf(draft) {
  endpointAnswers(draft);
  assert.ok(route, `the route spec-entry: ${pages.error?.message}`);
  const store = openStore("alice/agent-m");
  writeSetting(store, "github-token:alice/thesis-tool", TOKEN);
  writeSetting(store, "endpoint:ep1", { url: "https://ep1.example.test/v1", kind: "openai-compatible", model: "m", throughBridge: false });
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, { page: "review", instance: { repository: "alice/agent-m", host: fakeInstance() }, store, go() {},
    product: { address: ON_GITHUB.web, kind: "github", host: fakeProduct().host } }, { id: "draft" });
  for (const file of byClass(target, "input", "source-file")) file.checked = file.value === MAIN_FILE;
  const box = byClass(target, "input", "participant").find((each) => each.value === "drafter-a");
  assert.ok(box, "drafter-a is offered");
  box.checked = true;
  box.dispatchEvent(new Event("change"));
  click(byClass(target, "button", "prepare")[0]);
  await until(() => find(target, (node) => node.localName === "button" && node.textContent === "Run").length === 1, "the Run button");
  click(find(target, (node) => node.localName === "button" && node.textContent === "Run")[0]);
  await until(() => byClass(target, "section", "requirements-result").length === 1, "the candidates");
  assert.deepEqual(requests, ["https://ep1.example.test/v1/chat/completions"], "the only request is the endpoint's");
  return target;
}
const itemOf = (panel, name) => {
  const item = byClass(panel, "li", "candidate").find((each) => each.getAttribute("data-name") === name);
  assert.ok(item, `the candidate ${name} is in the panel`);
  return item;
};
// The text of the section "current-requirement" a candidate holds.
const currentOf = (item) => {
  const sections = byClass(item, "section", "current-requirement");
  assert.equal(sections.length, 1, `${item.getAttribute("data-name")} holds one section current-requirement`);
  return sections[0].textContent;
};

// TST-577001 · level: unit · module: MOD-review-pages
// guards: UC-005 (step 7); NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT
// given: a product whose SPEC holds A LOAN HAS A DUE DATE (source SRC-policy, ch. 1, normative) and A BOOK IS SHELVED; the endpoint returns a change of the first and a duplicate of the second
// input: the route spec-entry/draft, drafter-a, Run
// expect: each candidate holds a section "current-requirement" with the name, rule, sources with their authority and check of the requirement it refers to, and no paragraph "refers-to" stands anywhere
test("spec-entry/draft - each candidate stands beside the current text of the requirement it refers to", async () => {
  const panel = await panelOf(MIXED);
  const change = currentOf(itemOf(panel, CHANGE));
  for (const part of [LOAN, LOAN_RULE, "SRC-policy, ch. 1 (normative)", "tests/loan.test.mjs"]) assert.ok(change.includes(part), `${part} in ${JSON.stringify(change)}`);
  assert.ok(!change.includes(SHELF_RULE), "not the other requirement's rule");
  const duplicate = currentOf(itemOf(panel, DUPLICATE));
  for (const part of [SHELF, SHELF_RULE, "SRC-policy, ch. 1 (normative)", "tests/shelf.test.mjs"]) assert.ok(duplicate.includes(part), `${part} in ${JSON.stringify(duplicate)}`);
  assert.equal(byClass(panel, "p", "refers-to").length, 0, "the line Beside <name>. is gone");
  assert.ok(!panel.textContent.includes(`Beside ${LOAN}.`));
});

// TST-577002 · level: unit · module: MOD-review-pages
// guards: UC-005 (step 7; alternative flow 5b)
// given: the endpoint returns a new candidate that constrains the process and a change that constrains the product
// input: the route spec-entry/draft, drafter-a, Run
// expect: the candidate that constrains the process holds exactly one paragraph "constrains-process" reading "Constrains the process."; the other candidate holds none; the panel holds one
test("spec-entry/draft - a candidate that constrains the process is marked", async () => {
  const panel = await panelOf(GATES);
  const marks = byClass(itemOf(panel, GATE), "p", "constrains-process");
  assert.deepEqual(marks.map((mark) => mark.textContent), ["Constrains the process."]);
  assert.equal(byClass(itemOf(panel, CHANGE), "p", "constrains-process").length, 0);
  assert.equal(byClass(panel, "p", "constrains-process").length, 1);
});

// TST-577003 · level: unit · module: MOD-review-pages
// guards: UC-005 (alternative flow 7b); A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT
// given: the endpoint returns two duplicates, one of each requirement; and, in another run, a change and a duplicate
// input: the route spec-entry/draft, drafter-a, Run; then the class of one duplicate is set to new and back to duplicate, each time with the select's change event
// expect: the panel holds one paragraph "all-duplicates" reading "Every candidate is a duplicate: writing only adds sources to existing requirements."; the mixed run holds none; the message goes while one class is new and returns with the duplicate
test("spec-entry/draft - the panel says so when every candidate is a duplicate", async () => {
  const MESSAGE = "Every candidate is a duplicate: writing only adds sources to existing requirements.";
  const mixed = await panelOf(MIXED);
  assert.equal(byClass(mixed, "p", "all-duplicates").length, 0, "a change among the candidates: no message");

  const panel = await panelOf(ONLY_DUPLICATES);
  assert.deepEqual(byClass(panel, "p", "all-duplicates").map((each) => each.textContent), [MESSAGE]);
  const select = byClass(itemOf(panel, FIRST_DUPLICATE), "select", "class")[0];
  select.value = "new";
  select.dispatchEvent(new Event("change"));
  assert.equal(byClass(panel, "p", "all-duplicates").length, 0, "one candidate is new: no message");
  select.value = "duplicate";
  select.dispatchEvent(new Event("change"));
  assert.deepEqual(byClass(panel, "p", "all-duplicates").map((each) => each.textContent), [MESSAGE]);
});

// TST-577004 · level: unit · module: MOD-review-pages
// guards: UC-005 (step 7); NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT
// given: the change of A LOAN HAS A DUE DATE in the panel
// input: the "of" field is set to A BOOK IS SHELVED, then to a name the SPEC does not hold, each time with the field's input event
// expect: the current text beside the candidate is that of A BOOK IS SHELVED; then the sentence "This candidate refers to no current requirement." and none of the two rules
test("spec-entry/draft - the current text follows the requirement the person names", async () => {
  const panel = await panelOf(MIXED);
  const item = itemOf(panel, CHANGE), of = byClass(item, "input", "of")[0];
  of.value = SHELF;
  of.dispatchEvent(new Event("input"));
  const shelved = currentOf(item);
  assert.ok(shelved.includes(SHELF_RULE) && !shelved.includes(LOAN_RULE), JSON.stringify(shelved));
  of.value = "A NAME THE SPEC DOES NOT HOLD";
  of.dispatchEvent(new Event("input"));
  const none = currentOf(item);
  assert.ok(none.includes("This candidate refers to no current requirement."), JSON.stringify(none));
  assert.ok(!none.includes(SHELF_RULE) && !none.includes(LOAN_RULE), JSON.stringify(none));
});
