// MOD-review-pages' route for changing a use case by prompt (ITM-363), as the accepted text of docs/architecture/MOD-review-pages.md and UC-019 state it:
// "`<k>/<id>/prompt` — *Change by prompt*: the instruction, the participant, the run panel, the draft in the editor as its difference against the current text — a use case
// with a changed identifier the loop left restored first with `keptIdentifier` (UC-019 7a) —, *Refine* …, and *Save*, which saves the draft as an edit of UC-018 is saved — the
// use cases with one `saveFile`, in one commit (UC-019 8b), … only on the text the job read, with GitHub's pages without a token, and with the job's provenance lines" and the
// item's Outcome: the participants that can draft text with their places, or, with none, the reason and the link to UC-017's page; the run panel of `change-use-case`, nothing
// sent without Run; each of several files on its own with its difference; the findings left with the rounds; an unusable answer named, the raw answer folded, nothing
// written; Discard; Save, one click, refused with the draft kept when the text changed meanwhile. For UC-019 steps 1 to 9 for a use case and the alternative flows 3a, 4a, 5a,
// 6c, 7a, 8b, 8c, 9a. Refine is not tested: see the pull request.
// Run: node --test tests/review-pages-prompt-use-case.test.mjs
//
// Module: MOD-review-pages
// Guards: UC-019; A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT; A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS; NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY; THE PAGE STATES WHAT IT SENDS WHERE; A PARTICIPANT DECLARES ITS CAPABILITIES; A PARTICIPANT DECLARES WHERE IT PROCESSES DATA; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF; THE ROUNDS ARE COUNTED AND SHOWN; AN EDITED FILE KEEPS ITS IDENTIFIER; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT; WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
// Level: unit
//
// This imports the browser harness of tests/review-pages-use-cases.test.mjs unchanged. The data are UC-019's own example: the use cases UC-007 and UC-008, the instructions
// "add error handling to UC-007" and "align UC-007 and UC-008 with the new rule", and the finding "id changed from UC-007 to UC-043 [AN EDITED FILE KEEPS ITS IDENTIFIER]".
// The product is a fixture behind a Host of the tests' own (repositoryInfo with canWrite, readSnapshot, readHistory, commitFiles on the head that was read, else `Moved`); the
// instance is a read-only snapshot of this repository, whose book is on the disk, with the register of participants the test gives; the model endpoint stands behind the
// global `fetch`. The real MOD-job-runner, MOD-runtimes, MOD-job-ledger, MOD-approvals, MOD-artifact-edits, MOD-markdown-render (its editor, through openEditor only) and the
// rest run as they are, the strategies registered as the view hands them to the frame. Where the module file leaves a reading open, the test states the one it takes, and the
// pull request names it:
//   - The address is the use-case route with the id and the part `prompt=1` — #use-case/id=UC-007/prompt=1 —: the frame reads the parts of an address as `key=value`.
//   - The page holds <textarea class="instruction">, <ul class="participants"> as the drafting page does, <button class="prepare"> and the run panel; with no participant able
//     to draft, <p class="none"> and <a class="participants-link"> to #participants (UC-017's page, which this repository does not build yet).
//   - After a run: <p class="rounds">, <ul class="left"> with a <li> for each finding left, and <section class="drafts"> with one <div class="draft" data-path> for each file, holding
//     the editor opened on the current text with the draft shown against it (showDraft), and <button class="discard">; an unusable answer is <p class="unusable"> and
//     <details class="raw"> with the answer. Every file's editor saves all the files together in one commit (the editor has one Save each), and <p class="saved"> links the commit.
//   - Without a token on GitHub (the host cannot write) a save writes nothing and <a class="github-page"> opens GitHub's page for each file.
//   - The use case's page offers <a class="prompt-link"> to the prompt page.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import "./review-pages-use-cases.test.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const { openStore, writeSetting } = await import("../src/browser-store/index.mjs");
const { registerStrategies } = await import("../src/job-runner/index.mjs");
const pages = await import("../src/review-pages/index.mjs").catch((error) => ({ error }));
const route = pages.view?.routes.find((candidate) => candidate.name === "use-case");
(pages.view?.strategies ?? []).forEach((strategies, at) => registerStrategies(`tests/review-pages-prompt-use-case.test.mjs#${at}`, strategies));

// ---------------------------------------------------------------- the product

const text = (...lines) => `${lines.join("\n")}\n`;
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const failure = (name, message, fields = {}) => Object.assign(new Error(message), { name }, fields);
const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/thesis-tool", web: "https://github.com/alice/thesis-tool" };
const TOKEN = { value: "github_pat_ALICEthesisTOOL0123456789abcdef", name: "Agent M · thesis-tool", expires: "2027-01-01" };
const RULE = "A LOAN HAS A DUE DATE", OTHER = "A BOOK IS SHELVED";
const SPEC = text("# Thesis tool — Specification", "", "## Lending", "", `**${RULE}** *(Product Owner)*`, "Every loan states the date by which the book is returned.",
  "*Check:* `tests/loan.test.mjs`", "", `**${OTHER}** *(Product Owner)*`, "Every book stands on a shelf.", "*Check:* `tests/shelf.test.mjs`");
// A use case in its five parts, with the identifier and an alternative flow the test gives.
const useCase = (id, title, realises, alternative = "- **2a. The book is out.** Agent M says so.") => text("---", `id: ${id}`, `title: ${title}`, "area: lending", "actors:", "  - Author",
  "realises:", ...realises.map((name) => `  - ${name}`), "---", `# ${id} ${title}`, "", `**Goal.** ${title}.`, "", "## Actors", "", "- **Author**", "", "## Precondition", "",
  "- The product is managed.", "", "## Main flow", "", "1. The author starts.", "2. Agent M answers.", "", "## Alternative flows", "", alternative, "", "## Postcondition", "",
  "- Nothing is written.");
const UC7_PATH = "docs/use-cases/UC-007-derive-use-cases.md", UC8_PATH = "docs/use-cases/UC-008-review-use-cases.md";
const UC7 = useCase("UC-007", "Derive use cases", [RULE]), UC8 = useCase("UC-008", "Review use cases", [OTHER]);
const FILES = { "README.md": "# Thesis tool\n", "SPEC.md": SPEC, [UC7_PATH]: UC7, [UC8_PATH]: UC8 };
const WORKFLOW = ".github/workflows/agent-m-jobs.yml";
const ERROR_HANDLING = "add error handling to UC-007", ALIGN = "align UC-007 and UC-008 with the new rule";

// ---------------------------------------------------------------- the hosts

function fakeProduct(files = FILES, { canWrite = true } = {}) {
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
    return { repository: ON_GITHUB, ref, commit: sha, paths: [...tree.keys()].sort(), read: async (path) => (tree.has(path) ? tree.get(path) : null),
      blob: (path) => (tree.has(path) ? blobOf(tree.get(path)) : null) };
  };
  return {
    files: () => Object.fromEntries(commits.get(head).tree), head: () => head,
    writes: () => calls.filter((call) => call.fn === "commitFiles").map((call) => call.change),
    land(changed) { head = commitOf(new Map([...commits.get(head).tree, ...Object.entries(changed)]), head); },
    host: {
      async repositoryInfo() { return { defaultBranch: "trunk", visibility: "public", canWrite, archived: false, description: "" }; },
      async readSnapshot(ref) {
        if (ref === "trunk") return snapshotAt(head, "trunk");
        if (commits.has(ref)) return snapshotAt(ref, ref);
        throw failure("NotFound", `${ref} was not found`);
      },
      async readHistory() { return []; },
      async commitFiles(change) {
        calls.push({ fn: "commitFiles", change: structuredClone(change) });
        if (change.branch !== "trunk" || change.expectedHead !== head) throw failure("Moved", "the branch moved", { head });
        head = commitOf(new Map([...commits.get(head).tree, ...change.files.map((file) => [file.path, file.text])]), head);
        return { commit: head, url: `${ON_GITHUB.web}/commit/${head}` };
      },
    },
  };
}

const ROOT = new URL("../", import.meta.url);
const onDisk = (path) => { try { return readFileSync(new URL(path, ROOT), "utf8"); } catch { return null; } };
const REGISTER_HEAD = onDisk("docs/participants.md").split("\n").filter((line, at, all) => at <= all.findIndex((each) => each.startsWith("|---"))).join("\n");
const registerOf = (...rows) => `${REGISTER_HEAD}\n${rows.join("\n")}\n`;
const ENDPOINT_ROW = "| drafter-a | model endpoint | example-model | 200000 | — | draft text | this machine | endpoint ep1 |";
const TINY_ROW = "| tiny-b | model endpoint | other-model | 100 | — | draft text | this machine | endpoint ep1 |";
const CI_ROW = "| ci-agent | CI agent | model-x | 200000 | — | draft text | GitHub Actions in the USA | ci hosted secret CI_KEY |";
const READER_ROW = "| reader | person | — | — | — | read the repository | — | the GitHub account `reader` |";
function fakeInstance(register) {
  const snapshot = { repository: { server: "github", origin: "https://github.com", path: "alice/agent-m", web: "https://github.com/alice/agent-m" }, ref: "main",
    commit: "abc123def4567890abc123def4567890abc123de", paths: [], read: async (path) => (path === "docs/participants.md" ? register : onDisk(path)), blob: () => null };
  return { host: { async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: false, archived: false, description: "" }; },
    async readSnapshot() { return snapshot; } } };
}

// The model endpoint ep1 behind the global fetch: it answers the drafts given in turn (the last again), or a text that is no answer; every request is kept.
let requests = [];
const realFetch = globalThis.fetch;
function endpointAnswers(...drafts) {
  requests = [];
  const queue = [...drafts];
  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), body: String(init?.body ?? "") });
    const draft = queue.length > 1 ? queue.shift() : queue[0];
    const content = typeof draft === "string" ? draft : JSON.stringify({ draft, answers: [] });
    return new Response(JSON.stringify({ choices: [{ message: { content } }], usage: { prompt_tokens: 10, completion_tokens: 5 } }), { status: 200, headers: { "content-type": "application/json" } });
  };
}
test.afterEach(() => { globalThis.fetch = realFetch; });
const changed = (id, path, base, alternative) => ({ path, class: "change", of: id, text: base.replace(/- \*\*2a\..*$/m, alternative) });
const NEW_FLOW = "- **2a. The book is out.** Agent M says so.\n- **2b. The service fails.** Agent M reports the error and writes nothing.";
const draftOf = (...files) => ({ files });
const draft7 = () => changed("UC-007", UC7_PATH, UC7, NEW_FLOW);
const draft8 = () => changed("UC-008", UC8_PATH, UC8, NEW_FLOW);

// ---------------------------------------------------------------- the page

async function show(fake, params, { register = registerOf(ENDPOINT_ROW, CI_ROW, READER_ROW), token = true } = {}) {
  assert.ok(route, `the route use-case: ${pages.error?.message}`);
  const store = openStore(token ? "alice/agent-m" : "nobody/agent-m");
  if (token) writeSetting(store, "github-token:alice/thesis-tool", TOKEN);
  writeSetting(store, "endpoint:ep1", { url: "https://ep1.example.test/v1", kind: "openai-compatible", model: "m", throughBridge: false });
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, { page: "review", instance: { repository: "alice/agent-m", host: fakeInstance(register).host }, store, go() {},
    product: { address: ON_GITHUB.web, kind: "github", host: fake.host } }, params);
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
const runButtons = (root) => find(root, (node) => node.localName === "button" && node.textContent === "Run");
const saveButtons = (root) => find(root, (node) => node.localName === "button" && node.textContent === "Save");
const PAGE = (id = "UC-007") => ({ id, prompt: "1" });
// Writes the instruction, chooses the participant and shows the run panel.
async function panelFor(target, participant, instruction = ERROR_HANDLING) {
  const area = byClass(target, "textarea", "instruction")[0];
  area.value = instruction;
  const box = byClass(target, "input", "participant").find((each) => each.value === participant);
  box.checked = true;
  box.dispatchEvent(new Event("change"));
  click(byClass(target, "button", "prepare")[0]);
  await until(() => byClass(target, "section", "run-panel").length === 1, "the run panel");
}
async function runIt(target, participant = "drafter-a", instruction = ERROR_HANDLING) {
  await panelFor(target, participant, instruction);
  click(runButtons(target)[0]);
  await until(() => byClass(target, "p", "rounds").length === 1 || byClass(target, "p", "unusable").length === 1 || byClass(target, "p", "problem").length >= 1, "the result");
}
const draftBoxes = (target) => byClass(target, "div", "draft");
const areaIn = (box) => find(box, (node) => node.localName === "textarea")[0];
const userCaseCommits = (fake) => fake.writes().filter((change) => change.files.some((file) => file.path.startsWith("docs/use-cases/")));

// ---------------------------------------------------------------- the page offers it

// guards: UC-019 (step 1); EVERY STEP EXPLAINS ITSELF
// given: the page of UC-007, open
// input: the route with the id UC-007
// expect: a link "Change by prompt" to #use-case/id=UC-007/prompt=1
test("use-case/<id> — the page offers Change by prompt", async () => {
  const fake = fakeProduct();
  const target = await show(fake, { id: "UC-007" });
  const links = byClass(target, "a", "prompt-link");
  assert.equal(links.length, 1);
  assert.equal(links[0].getAttribute("href"), "#use-case/id=UC-007/prompt=1");
  assert.match(links[0].textContent, /Change by prompt/);
});

// ---------------------------------------------------------------- the participants

// guards: UC-019 (steps 2, 3); A PARTICIPANT DECLARES ITS CAPABILITIES; A PARTICIPANT DECLARES WHERE IT PROCESSES DATA; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: a register with a model endpoint and a CI agent that declare draft text and a person that does not
// input: the prompt page of UC-007
// expect: an instruction field; the two participants, each with its place and route; no Run; nothing written, nothing sent
test("use-case/<id>/prompt — the instruction and the participants that can draft text, with their places", async () => {
  endpointAnswers(draftOf(draft7()));
  const fake = fakeProduct();
  const target = await show(fake, PAGE());
  assert.equal(byClass(target, "textarea", "instruction").length, 1);
  const names = byClass(target, "li", "participant").map((item) => item.getAttribute("data-name")).sort();
  assert.deepEqual(names, ["ci-agent", "drafter-a"]);
  assert.match(byClass(byClass(target, "li", "participant")[0], "span", "place")[0].textContent, /this machine|GitHub Actions/);
  assert.equal(runButtons(target).length, 0);
  assert.equal(fake.writes().length, 0);
  assert.equal(requests.length, 0);
});

// guards: UC-019 (3a)
// given: a register in which no participant declares draft text
// input: the prompt page
// expect: the page says so and links UC-017's page; no way to a run panel; nothing written
test("use-case/<id>/prompt — with no participant able to draft, the reason and the link to UC-017's page", async () => {
  const fake = fakeProduct();
  const target = await show(fake, PAGE(), { register: registerOf(READER_ROW) });
  assert.match(byClass(target, "p", "none")[0].textContent, /draft text/);
  assert.equal(byClass(target, "a", "participants-link")[0].getAttribute("href"), "#participants");
  assert.equal(byClass(target, "button", "prepare").length, 0);
  assert.equal(fake.writes().length, 0);
});

// ---------------------------------------------------------------- the run panel

// guards: UC-019 (steps 4, 5, 4a, 5a); THE PAGE STATES WHAT IT SENDS WHERE; NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY; A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS
// given: the prompt page of UC-007; a participant whose context holds 100 tokens and one that holds 200000
// input: the run panel for each
// expect: for the large one the panel of change-use-case — the destination, where it processes data, the parts: the instruction, UC-007 with the requirement it realises, and UC-008 —
//         and the only Run; for the small one the panel says it does not fit and offers no Run; nothing written, nothing sent in either case
test("use-case/<id>/prompt — the run panel states what is sent where, and a context that does not fit sends nothing", async () => {
  endpointAnswers(draftOf(draft7()));
  const fake = fakeProduct();
  const target = await show(fake, PAGE(), { register: registerOf(ENDPOINT_ROW, TINY_ROW) });
  await panelFor(target, "drafter-a");
  const panel = byClass(target, "section", "run-panel")[0];
  assert.match(panel.textContent, /drafter-a/);
  assert.match(panel.textContent, /this machine/);
  const parts = byClass(panel, "li", "part").map((item) => item.textContent);
  assert.ok(parts.some((part) => part.startsWith("instruction")), parts.join("; "));
  assert.ok(parts.some((part) => part.includes(UC7_PATH)) && parts.some((part) => part.includes(UC8_PATH)), "UC-007 and every other use case");
  assert.equal(runButtons(target).length, 1);
  const small = await show(fake, PAGE(), { register: registerOf(ENDPOINT_ROW, TINY_ROW) });
  await panelFor(small, "tiny-b");
  assert.match(byClass(small, "section", "run-panel")[0].textContent, /cannot hold what it would receive/);
  assert.equal(runButtons(small).length, 0, "no Run");
  assert.equal(fake.writes().length, 0);
  assert.equal(requests.length, 0);
});

// ---------------------------------------------------------------- the draft

// guards: UC-019 (steps 6, 7, 8); A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT; THE ROUNDS ARE COUNTED AND SHOWN
// given: an endpoint that answers a changed UC-007 with an added alternative flow
// input: the instruction "add error handling to UC-007", Run
// expect: the rounds shown; one draft, its editor holding the draft and the difference against the current text — the added line marked —; nothing written to the use cases
test("use-case/<id>/prompt — the draft opens in the editor as its difference against the current text", async () => {
  endpointAnswers(draftOf(draft7()));
  const fake = fakeProduct();
  const target = await show(fake, PAGE());
  await runIt(target);
  assert.equal(requests.length, 1);
  assert.match(requests[0].body, /add error handling to UC-007/);
  const boxes = draftBoxes(target);
  assert.equal(boxes.length, 1);
  assert.equal(areaIn(boxes[0]).value, draft7().text);
  assert.match(byClass(boxes[0], "div", "newer")[0].textContent, /\+ - \*\*2b\. The service fails\./);
  assert.match(byClass(target, "p", "rounds")[0].textContent, /^Correction rounds: 1$/);
  assert.equal(userCaseCommits(fake).length, 0, "nothing written to the use cases");
});

// guards: UC-019 (8b); A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT
// given: an endpoint that answers changes of UC-007 and UC-008 for the instruction "align UC-007 and UC-008 with the new rule"
// input: Run
// expect: two drafts, each in its own editor with its own difference
test("use-case/<id>/prompt — several files are shown each on its own, with its difference", async () => {
  endpointAnswers(draftOf(draft7(), draft8()));
  const fake = fakeProduct();
  const target = await show(fake, PAGE());
  await runIt(target, "drafter-a", ALIGN);
  const boxes = draftBoxes(target);
  assert.deepEqual(boxes.map((box) => box.getAttribute("data-path")), [UC7_PATH, UC8_PATH]);
  for (const box of boxes) assert.match(byClass(box, "div", "newer")[0].textContent, /\+ - \*\*2b\./);
});

// guards: UC-019 (7a); AN EDITED FILE KEEPS ITS IDENTIFIER; THE ROUNDS ARE COUNTED AND SHOWN
// given: an endpoint that always answers UC-007 under the identifier UC-043
// input: Run
// expect: the loop leaves the finding "id changed from UC-007 to UC-043 [AN EDITED FILE KEEPS ITS IDENTIFIER]", shown with the rounds; the editor opens with the identifier
//         restored to UC-007, every other byte as drafted
test("use-case/<id>/prompt — a changed identifier the loop left is restored before the editor opens, and the findings left are shown with the rounds", async () => {
  const wrong = draft7();
  wrong.text = wrong.text.replace("id: UC-007", "id: UC-043").replace("# UC-007", "# UC-043");
  endpointAnswers(draftOf(wrong));
  const fake = fakeProduct();
  const target = await show(fake, PAGE());
  await runIt(target);
  assert.match(byClass(target, "ul", "left")[0].textContent, /AN EDITED FILE KEEPS ITS IDENTIFIER/);
  assert.match(byClass(target, "p", "rounds")[0].textContent, /^Correction rounds: [2-9]/);
  const shown = areaIn(draftBoxes(target)[0]).value;
  assert.match(shown, /^id: UC-007$/m);
  assert.equal(shown.replace("id: UC-007", "id: UC-043"), wrong.text.replace("# UC-043", "# UC-007"), "every other byte as drafted");
});

// guards: UC-019 (6c); A GENERATED ARTIFACT IS A PROPOSAL
// given: an endpoint whose answer is no JSON
// input: Run
// expect: the page says the answer could not be read and folds the raw answer; no editor; nothing written to the use cases
test("use-case/<id>/prompt — an unusable answer is named, the raw answer folded, nothing written", async () => {
  endpointAnswers("this is not JSON, it is a remark");
  const fake = fakeProduct();
  const target = await show(fake, PAGE());
  await runIt(target);
  assert.match(byClass(target, "p", "unusable")[0].textContent, /could not be read/);
  assert.match(byClass(byClass(target, "details", "raw")[0], "pre", "answer")[0]?.textContent ?? byClass(target, "details", "raw")[0].textContent, /this is not JSON/);
  assert.equal(draftBoxes(target).length, 0);
  assert.equal(userCaseCommits(fake).length, 0);
});

// ---------------------------------------------------------------- discard and save

// guards: UC-019 (5a, 8c); THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: a draft in the editor
// input: a click on Discard
// expect: the drafts are gone from the page; nothing written to the use cases; and, before any Run, nothing was sent
test("use-case/<id>/prompt — Discard removes the draft and writes nothing", async () => {
  endpointAnswers(draftOf(draft7()));
  const fake = fakeProduct();
  const target = await show(fake, PAGE());
  await runIt(target);
  assert.equal(draftBoxes(target).length, 1, "known positive: the draft is there");
  click(byClass(target, "button", "discard")[0]);
  assert.equal(draftBoxes(target).length, 0);
  assert.equal(userCaseCommits(fake).length, 0);
});

// guards: UC-019 (8b, 9); AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT; ONE CLICK PER DECISION; A DRAFTED CHANGE IS A PROPOSAL
// given: two drafts, UC-007 and UC-008, the second edited by the person in its editor
// input: a click on Save
// expect: one commit holding both use cases — the drafts, the second as edited, byte for byte, no trailer in a file —, whose message ends with the job's provenance lines:
//         the kind, the participant and its model, the rounds and the instruction; the page links the commit
test("use-case/<id>/prompt — Save writes the use cases in one commit with the provenance lines", async () => {
  endpointAnswers(draftOf(draft7(), draft8()));
  const fake = fakeProduct();
  const target = await show(fake, PAGE());
  await runIt(target, "drafter-a", ALIGN);
  const boxes = draftBoxes(target);
  const edited = `${draft8().text}\nA line the person added.\n`;
  areaIn(boxes[1]).value = edited;
  areaIn(boxes[1]).dispatchEvent(new Event("input"));
  click(saveButtons(boxes[0])[0]);
  await until(() => byClass(target, "p", "saved").length === 1, "the commit");
  assert.equal(userCaseCommits(fake).length, 1, "one commit");
  const [change] = userCaseCommits(fake);
  assert.deepEqual(change.files.map((file) => [file.path, file.text]), [[UC7_PATH, draft7().text], [UC8_PATH, edited]]);
  assert.ok(change.files.every((file) => !file.text.includes("Agent-M-")), "no trailer in a file");
  const lines = change.message.split("\n");
  for (const wanted of ["Agent-M-Kind: change-use-case", "Agent-M-Participant: drafter-a", "Agent-M-Model: example-model", "Agent-M-Rounds: 1", `Agent-M-Instruction: ${ALIGN}`]) {
    assert.ok(lines.includes(wanted), `${wanted} in ${change.message}`);
  }
  assert.ok(find(byClass(target, "p", "saved")[0], (node) => node.localName === "a").some((node) => node.getAttribute("href").includes(`/commit/${fake.head()}`)));
});

// guards: UC-019 (9a); A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT
// given: two drafts; then another writer changes UC-008 while the participant drafted
// input: a click on Save
// expect: nothing written; both drafts stay in their editors; the newer version of UC-008 is beside the draft
test("use-case/<id>/prompt — a use case changed meanwhile refuses the save and the draft stays", async () => {
  endpointAnswers(draftOf(draft7(), draft8()));
  const fake = fakeProduct();
  const target = await show(fake, PAGE());
  await runIt(target, "drafter-a", ALIGN);
  const newer = UC8.replace("Agent M says so.", "Agent M says so, at once.");
  fake.land({ [UC8_PATH]: newer });
  const before = userCaseCommits(fake).length;
  click(saveButtons(draftBoxes(target)[0])[0]);
  await until(() => byClass(draftBoxes(target)[0], "div", "newer")[0].textContent.includes("at once."), "the newer text");
  assert.equal(userCaseCommits(fake).length, before, "nothing written");
  assert.equal(areaIn(draftBoxes(target)[0]).value, draft7().text);
  assert.equal(areaIn(draftBoxes(target)[1]).value, draft8().text);
});

// guards: UC-019 (9, UC-018 4a); WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; NO TEXT TRAVELS IN A URL
// given: a GitHub product whose host cannot write, a draft of UC-007
// input: a click on Save
// expect: nothing written; GitHub's page for the file, its address without the text
test("use-case/<id>/prompt — without a token, GitHub's page opens for each file", async () => {
  endpointAnswers(draftOf(draft7()));
  const fake = fakeProduct(FILES, { canWrite: false });
  const target = await show(fake, PAGE());
  await runIt(target);
  click(saveButtons(draftBoxes(target)[0])[0]);
  await until(() => byClass(target, "a", "github-page").length === 1, "GitHub's page");
  assert.equal(fake.writes().filter((change) => change.files.some((file) => file.path.startsWith("docs/use-cases/"))).length, 0);
  assert.ok(!decodeURIComponent(byClass(target, "a", "github-page")[0].getAttribute("href")).includes("service fails"), "no text in the address");
});

// ---------------------------------------------------------------- another route

// guards: UC-019 (6b); A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: a product that holds the job workflow, the CI agent chosen
// input: the run panel, Run
// expect: nothing sent from the tab; one commit holding the job's start record of the kind change-use-case with the instruction among its parameters; the page says the job is queued
test("use-case/<id>/prompt — a job of a CI agent is queued there, with the instruction in its record", async () => {
  endpointAnswers(draftOf(draft7()));
  const fake = fakeProduct({ ...FILES, [WORKFLOW]: "name: Agent M jobs\n" });
  const target = await show(fake, PAGE());
  await panelFor(target, "ci-agent");
  click(runButtons(target)[0]);
  await until(() => byClass(target, "p", "queued").length === 1, "the queueing");
  assert.equal(requests.length, 0);
  const record = fake.writes()[0].files[0].text;
  assert.match(record, /^kind: change-use-case$/m);
  assert.ok(record.includes(ERROR_HANDLING), "the instruction in the parameters");
  assert.ok(record.includes("UC-007"), "and the use case");
});
