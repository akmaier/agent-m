// MOD-review-pages' requirement routes for changing one requirement or a group by prompt (ITM-398), as UC-019 and
// docs/architecture/MOD-review-pages.md state them: the instruction, participant and run panel of change-requirements;
// the prompting person's linked source in the job; classified requirement candidates reviewed by the person; Refine on
// the current draft; and each composed section saved through proposeSection, only while its opened text still stands,
// with the job's provenance trailers. Without the person's linked source nothing is sent, and registering and linking it
// are offered. Run: node --test tests/review-pages-prompt-requirements.test.mjs
//
// Module: MOD-review-pages
// Guards: UC-019; THE PERSON WHO PROMPTS IS A SOURCE; A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES; A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT; THE PAGE STATES WHAT IT SENDS WHERE; A SPEC EDIT IS SAVED AS A PROPOSAL; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
// Level: unit
//
// The frame parses route parts as key=value. Therefore one requirement arrives as { name, prompt: "1" }, while a group
// arrives as { requirements: JSON.stringify(names), prompt: "1" }. The page turns either into the job parameter
// `requirements`, an array. This instance's author is github.com/alice; SRC-alice is the linked person entry with that
// identifier. The page follows the existing
// prompt and requirements-draft vocabulary: textarea.instruction, input.participant, button.prepare, section.run-panel,
// section.requirements-result, li.candidate with select.class, input.of and textarea.candidate-rule, textarea.refinement,
// button.refine, and button Save. A refused section is shown in div.newer. Registration and linking lead to #library and
// #sources. Each test states given/input/expect directly before it. The fixture endpoint is local to global fetch.

import "./review-pages-use-cases.test.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const { openStore, writeSetting } = await import("../src/browser-store/index.mjs");
const { registerStrategies } = await import("../src/job-runner/index.mjs");
const pages = await import("../src/review-pages/index.mjs").catch((error) => ({ error }));
const oneRoute = pages.view?.routes.find((candidate) => candidate.name === "requirement");
const groupRoute = pages.view?.routes.find((candidate) => candidate.name === "requirements");
(pages.view?.strategies ?? []).forEach((strategies, at) => registerStrategies(`tests/review-pages-prompt-requirements.test.mjs#${at}`, strategies));

// ---------------------------------------------------------------- product and source register

const text = (...lines) => `${lines.join("\n")}\n`;
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const failure = (name, message, fields = {}) => Object.assign(new Error(message), { name, ...fields });
const GITHUB = { server: "github", origin: "https://github.com", path: "alice/thesis-tool", web: "https://github.com/alice/thesis-tool" };
const TOKEN = { value: "github_pat_ALICEthesisTOOL0123456789abcdef", name: "Alice", expires: "2027-01-01" };
const LOAN = "A LOAN HAS A DUE DATE", SHELF = "A BOOK IS SHELVED";
const HEADING = "## 1. Lending";
const LENDING = text(HEADING, "", `**${LOAN}** *(Product Owner)*`, "Every loan states the date by which the book is returned.",
  "*Check:* `tests/loan.test.mjs`", "", `**${SHELF}** *(Product Owner)*`, "Every book stands on a shelf.", "*Check:* `tests/shelf.test.mjs`");
const SPEC_HEAD = text("# Thesis tool - Specification", "");
const SPEC = SPEC_HEAD + LENDING;
const SOURCE = "SRC-alice";
const SOURCE_HASH = "0".repeat(64);
const LINKS = text("# Requirement sources of the thesis tool", "", "| Source | Version | Hash | Part |", "|---|---|---|---|",
  `| ${SOURCE} | 2026-10-13 | ${SOURCE_HASH} | prompt |`);
const NO_LINKS = text("# Requirement sources of the thesis tool", "", "| Source | Version | Hash | Part |", "|---|---|---|---|");
const PERSON_SOURCE = text("---", `id: ${SOURCE}`, "title: Alice", "kind: person", "identifier: github.com/alice", "authority: informative",
  "licence: may be republished - fixture", "---", `# ${SOURCE} Alice`, "", "## Versions", "",
  "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  "| `2026-10-13` | 2026-10-13 | fixture | this repository | one file, hashed only |");
const WORKFLOW = ".github/workflows/agent-m-jobs.yml";
const PRODUCT_FILES = { "README.md": "# Thesis tool\n", "SPEC.md": SPEC, "docs/sources.md": LINKS, [WORKFLOW]: "name: Agent M jobs\n" };

function fakeProduct(files = PRODUCT_FILES) {
  const calls = [], commits = new Map();
  let made = 0, head = null;
  const commitOf = (tree, parent) => {
    const sha = createHash("sha1").update(`commit ${++made}`).digest("hex");
    commits.set(sha, { tree, parent });
    return sha;
  };
  head = commitOf(new Map(Object.entries(files)), null);
  const snapshotAt = (sha, ref) => {
    const { tree } = commits.get(sha);
    return { repository: GITHUB, ref, commit: sha, paths: [...tree.keys()].sort(), read: async (path) => (tree.has(path) ? tree.get(path) : null),
      blob: (path) => (tree.has(path) ? blobOf(tree.get(path)) : null) };
  };
  return {
    files: () => Object.fromEntries(commits.get(head).tree),
    writes: () => calls.map((call) => call.change),
    land(changed) { head = commitOf(new Map([...commits.get(head).tree, ...Object.entries(changed)]), head); },
    host: {
      async repositoryInfo() { return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" }; },
      async readSnapshot(ref) {
        if (ref === "trunk") return snapshotAt(head, "trunk");
        if (commits.has(ref)) return snapshotAt(ref, ref);
        throw failure("NotFound", `${ref} was not found`);
      },
      async readHistory() { return []; },
      async commitFiles(change) {
        calls.push({ change: structuredClone(change) });
        if (change.branch !== "trunk" || change.expectedHead !== head) throw failure("Moved", "the branch moved", { head });
        head = commitOf(new Map([...commits.get(head).tree, ...change.files.map((file) => [file.path, file.text])]), head);
        return { commit: head, url: `${GITHUB.web}/commit/${head}` };
      },
    },
  };
}

const ROOT = new URL("../", import.meta.url);
const onDisk = (path) => { try { return readFileSync(new URL(path, ROOT), "utf8"); } catch { return null; } };
const REGISTER_HEAD = onDisk("docs/participants.md").split("\n").filter((line, at, all) => at <= all.findIndex((each) => each.startsWith("|---"))).join("\n");
const registerOf = (...rows) => `${REGISTER_HEAD}\n${rows.join("\n")}\n`;
const ENDPOINT_ROW = "| drafter-a | model endpoint | example-model | 200000 | - | draft text | this machine | endpoint ep1 |";
const CI_ROW = "| ci-agent | CI agent | model-x | 200000 | - | draft text | GitHub Actions in the USA | ci hosted secret CI_KEY |";

function fakeInstance(register = registerOf(ENDPOINT_ROW, CI_ROW)) {
  const entries = { [`docs/sources/${SOURCE}.md`]: PERSON_SOURCE };
  const snapshot = { repository: { server: "github", origin: "https://github.com", path: "alice/agent-m", web: "https://github.com/alice/agent-m" },
    ref: "main", commit: "abc123def4567890abc123def4567890abc123de", paths: Object.keys(entries).sort(),
    read: async (path) => (path === "docs/participants.md" ? register : path in entries ? entries[path] : onDisk(path)), blob: () => null };
  return { host: { async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: false, archived: false, description: "" }; },
    async readSnapshot() { return snapshot; } } };
}

// ---------------------------------------------------------------- endpoint and page

const candidate = (name, fields = {}) => ({ name, rule: `${name.toLowerCase()} rule.`, check: "`tests/fixture.test.mjs`",
  constrains: "product", passage: "the instruction", class: "new", ...fields });
const RENEW = "A MEMBER CAN RENEW ONCE", CONFLICT = "THE DUE DATE MAY BE HIDDEN";
const DRAFT = { candidates: [
  candidate(RENEW, { passage: "renewal" }),
  candidate(CONFLICT, { class: "conflict", of: LOAN, passage: "due date", rule: "Every loan may hide its due date." }),
] };
const REFINED = { candidates: [
  candidate(RENEW, { passage: "renewal", rule: "Every member may renew a loan once." }),
  candidate(CONFLICT, { class: "conflict", of: LOAN, passage: "due date", rule: "Every loan shows its due date." }),
] };

let requests = [];
const realFetch = globalThis.fetch;
function endpointAnswers(...drafts) {
  requests = [];
  const queue = drafts.length ? [...drafts] : [DRAFT];
  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), body: String(init?.body ?? "") });
    const draft = queue.length > 1 ? queue.shift() : queue[0];
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ draft, answers: [] }) } }],
      usage: { prompt_tokens: 10, completion_tokens: 5 } }), { status: 200, headers: { "content-type": "application/json" } });
  };
}
test.afterEach(() => { globalThis.fetch = realFetch; });

async function show(fake, params, { register = registerOf(ENDPOINT_ROW, CI_ROW) } = {}) {
  const route = "name" in params ? oneRoute : groupRoute;
  assert.ok(route, `the requirement route: ${pages.error?.message}`);
  const store = openStore("alice/agent-m");
  writeSetting(store, "github-token:alice/thesis-tool", TOKEN);
  writeSetting(store, "endpoint:ep1", { url: "https://ep1.example.test/v1", kind: "openai-compatible", model: "m", throughBridge: false });
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, { page: "review", instance: { repository: "alice/agent-m", host: fakeInstance(register).host }, store, go() {},
    product: { address: GITHUB.web, kind: "github", host: fake.host } }, params);
  return target;
}

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
const ONE = { name: LOAN, prompt: "1" };
const GROUP = { requirements: JSON.stringify([LOAN, SHELF]), prompt: "1" };
const runButtons = (root) => find(root, (node) => node.localName === "button" && node.textContent === "Run");
const saveButtons = (root) => find(root, (node) => node.localName === "button" && node.textContent === "Save");
const proposals = (fake) => fake.writes().filter((change) => change.files.some((file) => file.path.endsWith(".begruendung.md")));
const candidateOf = (target, name) => byClass(target, "li", "candidate").find((item) => item.getAttribute("data-name") === name);

async function panelFor(target, participant, instruction) {
  const area = byClass(target, "textarea", "instruction")[0];
  assert.ok(area, "the requirement prompt route has its instruction field");
  area.value = instruction;
  const box = byClass(target, "input", "participant").find((each) => each.value === participant);
  assert.ok(box, `${participant} is offered`);
  box.checked = true;
  box.dispatchEvent(new Event("change"));
  const prepare = byClass(target, "button", "prepare")[0];
  assert.ok(prepare, "Show the run panel is offered");
  click(prepare);
  await until(() => byClass(target, "section", "run-panel").length === 1 || byClass(target, "p", "problem").length > 0, "the run panel");
  assert.equal(byClass(target, "section", "run-panel").length, 1, target.textContent);
}

async function runIt(target, instruction = "Make the due date clearer.") {
  await panelFor(target, "drafter-a", instruction);
  assert.equal(runButtons(target).length, 1, "one Run decision");
  click(runButtons(target)[0]);
  await until(() => byClass(target, "section", "requirements-result").length === 1 || byClass(target, "p", "problem").length > 0, "the requirement draft");
  assert.equal(byClass(target, "section", "requirements-result").length, 1, target.textContent);
}

function queuedRecord(fake) {
  const path = Object.keys(fake.files()).find((name) => /^docs\/jobs\/JOB-.*\.md$/.test(name));
  assert.ok(path, "the queued job record exists");
  return fake.files()[path];
}

// ---------------------------------------------------------------- routes and the person's source

// TST-398001 · level: unit · module: MOD-review-pages
// guards: UC-019 steps 1 to 6; THE PERSON WHO PROMPTS IS A SOURCE; THE PAGE STATES WHAT IT SENDS WHERE
// given: A LOAN HAS A DUE DATE and the linked person source SRC-alice for the product owner github.com/alice; a CI drafting participant
// input: { name: A LOAN HAS A DUE DATE, prompt: "1" }, an instruction, Show the run panel, Run
// expect: change-requirements is queued for that one name, with the instruction and source SRC-alice among its parameters; nothing is sent from the tab
test("requirement/<name>/prompt — queues one named requirement with the person's linked source", async () => {
  endpointAnswers();
  const fake = fakeProduct();
  const target = await show(fake, ONE);
  await panelFor(target, "ci-agent", "Make the due date clearer.");
  click(runButtons(target)[0]);
  await until(() => byClass(target, "p", "queued").length === 1, "the queued job");
  const record = queuedRecord(fake);
  assert.match(record, /^kind: change-requirements$/m);
  assert.match(record, /"requirements": \[\s*"A LOAN HAS A DUE DATE"\s*\]/);
  assert.match(record, /"source": "SRC-alice"/);
  assert.match(record, /Make the due date clearer\./);
  assert.equal(requests.length, 0, "the CI route sends nothing from this tab");
});

// TST-398002 · level: unit · module: MOD-review-pages
// guards: UC-019 steps 1 to 6; THE PERSON WHO PROMPTS IS A SOURCE; NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
// given: two requirements and the linked person source SRC-alice
// input: { requirements: JSON.stringify([A LOAN HAS A DUE DATE, A BOOK IS SHELVED]), prompt: "1" }, an instruction, Show the run panel, Run
// expect: one change-requirements job names both requirements in that order and source SRC-alice; the run panel states that both named requirements are sent
test("requirements/prompt — the JSON route parameter queues the named group in order", async () => {
  endpointAnswers();
  const fake = fakeProduct();
  const target = await show(fake, GROUP);
  await panelFor(target, "ci-agent", "Align both lending rules.");
  const parts = byClass(target, "li", "part").map((item) => item.textContent);
  assert.ok(parts.some((part) => part.includes(LOAN)) && parts.some((part) => part.includes(SHELF)), parts.join("; "));
  click(runButtons(target)[0]);
  await until(() => byClass(target, "p", "queued").length === 1, "the queued group job");
  const record = queuedRecord(fake);
  assert.ok(record.indexOf(LOAN) < record.indexOf(SHELF), "the job keeps the group's order");
  assert.match(record, /"source": "SRC-alice"/);
});

// TST-398003 · level: unit · module: MOD-review-pages
// guards: UC-019 alternative flow 4b; THE PERSON WHO PROMPTS IS A SOURCE; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: the same person source in the instance, but a product whose source links do not link it
// input: the requirement prompt route
// expect: the page says the author has no linked source and links #library to register one and #sources to link it; no run panel, request or write
test("requirement/<name>/prompt — without the person's linked source nothing is sent and both ways on are linked", async () => {
  endpointAnswers();
  const fake = fakeProduct({ ...PRODUCT_FILES, "docs/sources.md": NO_LINKS });
  const target = await show(fake, ONE);
  assert.match(target.textContent, /source/i);
  const hrefs = find(target, (node) => node.localName === "a").map((node) => node.getAttribute("href"));
  assert.ok(hrefs.includes("#library"), `register a source: ${hrefs}`);
  assert.ok(hrefs.includes("#sources"), `link a source: ${hrefs}`);
  assert.equal(byClass(target, "button", "prepare").length, 0, "no way to a run panel");
  assert.equal(requests.length, 0, "nothing sent");
  assert.equal(fake.writes().length, 0, "nothing written");
});

// ---------------------------------------------------------------- review, refine and save

// TST-398004 · level: unit · module: MOD-review-pages
// guards: UC-019 steps 7 to 9 and alternative flow 8a; A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES; A SPEC EDIT IS SAVED AS A PROPOSAL; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
// given: a draft with a new renewal requirement and a conflict with A LOAN HAS A DUE DATE
// input: Run; class the renewal as a duplicate of A BOOK IS SHELVED; resolve the conflict as a change of A LOAN HAS A DUE DATE; Save
// expect: one proposal section carries both decisions and SRC-alice, SPEC.md is untouched, and the commit ends in the job's provenance trailers
test("requirement/<name>/prompt — changed classes and a resolved conflict reach the saved entry with provenance", async () => {
  endpointAnswers(DRAFT);
  const fake = fakeProduct();
  const target = await show(fake, ONE);
  await runIt(target);

  const renewal = candidateOf(target, RENEW);
  assert.ok(renewal, "known positive: the returned renewal candidate is shown");
  byClass(renewal, "select", "class")[0].value = "duplicate";
  byClass(renewal, "input", "of")[0].value = SHELF;
  const conflict = candidateOf(target, CONFLICT);
  assert.ok(conflict, "the conflict is shown for the person to decide");
  byClass(conflict, "select", "class")[0].value = "change";
  byClass(conflict, "input", "of")[0].value = LOAN;

  assert.equal(saveButtons(target).length, 1, "one Save decision for the composed section");
  click(saveButtons(target)[0]);
  await until(() => proposals(fake).length === 1, "the proposed section");
  const [change] = proposals(fake);
  assert.ok(!change.files.some((file) => file.path === "SPEC.md"), "SPEC.md stays unchanged");
  const proposal = change.files.find((file) => /\/\d\d-[^/]+\.md$/.test(file.path) && !file.path.endsWith(".begruendung.md"));
  assert.ok(proposal, "the entry's proposed section exists");
  assert.match(proposal.text, /Every loan may hide its due date\./);
  assert.match(proposal.text, /SRC-alice, due date/);
  assert.match(proposal.text, /SRC-alice, renewal/);
  assert.doesNotMatch(proposal.text, new RegExp(`\\*\\*${RENEW}\\*\\*`), "the candidate classed duplicate was not added");
  for (const line of ["Agent-M-Kind: change-requirements", "Agent-M-Participant: drafter-a", "Agent-M-Model: example-model",
    "Agent-M-Rounds: 1", "Agent-M-Instruction: Make the due date clearer."]) {
    assert.ok(change.message.split("\n").includes(line), `${line} in ${change.message}`);
  }
});

// TST-398005 · level: unit · module: MOD-review-pages
// guards: UC-019 step 8; A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT; THE ROUNDS ARE COUNTED AND SHOWN
// given: the first run's editable candidate draft; the endpoint's second answer is a refined draft
// input: edit the renewal rule, write a follow-up, press Refine, inspect its renewed panel, then press Run
// expect: Refine sends nothing; Run makes one more request with the edited draft and follow-up, replacing the shown draft
test("requirement/<name>/prompt — Refine runs once more with the current edited draft", async () => {
  endpointAnswers(DRAFT, REFINED);
  const fake = fakeProduct();
  const target = await show(fake, ONE);
  await runIt(target);
  assert.equal(requests.length, 1, "known positive: the first Run made one request");

  const renewal = candidateOf(target, RENEW);
  const rule = byClass(renewal, "textarea", "candidate-rule")[0];
  assert.ok(rule, "the returned rule is editable");
  rule.value = "The current draft says a member renews twice.";
  rule.dispatchEvent(new Event("input"));
  const followUp = byClass(target, "textarea", "refinement")[0];
  assert.ok(followUp, "the follow-up instruction is offered");
  followUp.value = "Make the renewal limit one.";
  const refine = byClass(target, "button", "refine")[0];
  assert.ok(refine, "Refine is offered");
  click(refine);
  await until(() => byClass(target, "section", "run-panel").length === 2, "the refinement's run panel");
  assert.equal(requests.length, 1, "the follow-up is disclosed before the person sends it");
  const panel = byClass(target, "section", "run-panel")[1];
  const send = find(panel, (node) => node.localName === "button" && node.textContent === "Run")[0];
  assert.ok(send, "the refinement has its own send decision");
  click(send);
  await until(() => requests.length === 2, "one refinement request");
  assert.equal(requests.length, 2, "Refine runs exactly once more");
  assert.match(requests[1].body, /The current draft says a member renews twice\./);
  assert.match(requests[1].body, /Make the renewal limit one\./);
  await until(() => candidateOf(target, RENEW)
    && byClass(candidateOf(target, RENEW), "textarea", "candidate-rule")[0]?.value === "Every member may renew a loan once.", "the refined draft");
});

// TST-398006 · level: unit · module: MOD-review-pages
// guards: UC-019 alternative flow 9a; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT
// given: a resolved conflict draft, then another writer changes its SPEC section on the default branch
// input: Save
// expect: no proposal is written; the candidate draft stays editable beside the newer section
test("requirement/<name>/prompt — a stale section refuses Save and keeps the draft beside the newer text", async () => {
  endpointAnswers(DRAFT);
  const fake = fakeProduct();
  const target = await show(fake, ONE);
  await runIt(target);
  const conflict = candidateOf(target, CONFLICT);
  byClass(conflict, "select", "class")[0].value = "change";
  byClass(conflict, "input", "of")[0].value = LOAN;
  const rule = byClass(conflict, "textarea", "candidate-rule")[0];
  assert.ok(rule, "the conflict's current draft is editable");
  const kept = "Every loan visibly states its due date.";
  rule.value = kept;
  rule.dispatchEvent(new Event("input"));
  fake.land({ "SPEC.md": SPEC_HEAD + LENDING.replace("returned.", "returned on time.") });

  const before = proposals(fake).length;
  click(saveButtons(target)[0]);
  await until(() => byClass(target, "div", "newer").some((node) => node.textContent.includes("returned on time.")), "the newer section");
  assert.equal(proposals(fake).length, before, "nothing proposed");
  assert.equal(byClass(candidateOf(target, CONFLICT), "textarea", "candidate-rule")[0].value, kept, "the current draft stays");
});
