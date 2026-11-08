// The prompt bar gives the person's account as the `source` of every message and hand-over, and takes a message that names another product as about that product
// (UC-019 step 6, UC-049 3d), as docs/architecture/MOD-prompt-bar.md states it: "On *Send* … and, as `source`, the account MOD-source-register's `personAccount`
// gives for the instance's snapshot it reads — on every page, the frame's default subject included, and in this one place"; "A finding that keeps it from starting —
// a change of requirements without a `source`, where the instance's address names no owner and so no account … — is named, and nothing runs"; "**A message that names
// another product** (UC-049 3d): on *Send* the bar asks `namedProduct` for the person's words over `products`, less an entry that is the instance's own repository.
// Where it gives a product other than the page's …, that product, with its host from `products`, is the message's page in place of the page shown: the job's context
// is that product, and the subject's parameters are replaced by `page`, naming that product's address and that the message named it, with none of the shown page's
// artifact parameters …; with recording on, the record appended is that product's; … *Review the draft* to the review pages' `draft` with that product named in
// `go`'s `product`; and the bar says above the answer `About <owner/repo> — named in your message.` Where this browser keeps no token for that product, nothing is
// sent: the bar names the product and links the route `add-product` through `go` … Where it gives the page's own product, or none, nothing changes."
// Run: node --test tests/prompt-bar-account-and-named-product.test.mjs
//
// Module: MOD-prompt-bar
// Guards: UC-049; UC-019; THE PERSON WHO PROMPTS IS A SOURCE; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON; A RECORDED CONVERSATION IS KEPT WHERE IT WAS HELD
// Level: component
//
// The small DOM, the store, the repositories in memory and the endpoint behind `fetch` are those of tests/prompt-bar-one-kind.test.mjs, copied; a repository's
// address may be given apart from its web address, so that an instance whose address names no owner can be built. The real MOD-job-runner, MOD-runtimes,
// MOD-job-catalogue and MOD-spec-changes' strategies run as they are; the book's chapters are a fixture recipe that gives no part. The page shown is a product,
// thesis-tool, whose subject opens the requirement A LOAN HAS A DUE DATE and gives no `source`; the products this browser manages are thesis-tool, AlienInvasion and the
// instance itself. Readings the texts leave open, which the tests state: the line `About …` stands in the bar's status above the answer; the subject's key of a message
// about a named product names that product. Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded
// in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
// Agent M's own SPEC.md, which the fixture instance holds: a kind of requirement-form takes the form its draft is checked by from it.
const INSTANCE_SPEC = readFileSync(new URL("../SPEC.md", import.meta.url), "utf8");
import { openStore, readTabValue, writeSetting } from "../src/browser-store/index.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";
import { latestDraft, startPromptBar } from "../src/prompt-bar/index.mjs";
import { specStrategies } from "../src/spec-changes/index.mjs";
import { issueStrategies } from "../src/issue-handling/index.mjs";
import { tick, until } from "./prompt-bar.d/until.mjs";

// ---------------------------------------------------------------- the part of a browser's DOM that is used

class Text { constructor(data) { this.data = String(data); this.parentNode = null; } get textContent() { return this.data; } }
class Element extends EventTarget {
  constructor(name) {
    super();
    Object.assign(this, { localName: name, childNodes: [], className: "", value: "", type: "", hidden: false, disabled: false, parentNode: null, attrs: {}, html: "" });
  }
  append(...nodes) { for (const node of nodes.flat()) { const child = typeof node === "string" ? new Text(node) : node; this.childNodes.push(child); child.parentNode = this; } }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  setAttribute(name, value) { this.attrs[name] = String(value); }
  getAttribute(name) { return this.attrs[name] ?? null; }
  set innerHTML(value) { this.html = String(value); }
  get innerHTML() { return this.html; }
  get textContent() { return this.html + this.childNodes.map((child) => child.textContent).join(""); }
  focus() {}
}
globalThis.document = { createElement: (name) => new Element(name) };

const all = (root, check) => { const found = []; (function visit(node) { for (const child of node.childNodes ?? []) if (child instanceof Element) { if (check(child)) found.push(child); visit(child); } })(root); return found; };
const byClass = (root, name) => all(root, (node) => node.className.split(" ").includes(name));
const one = (root, name) => byClass(root, name)[0];
const textOf = (node) => node?.textContent ?? "";
const trusted = () => Object.defineProperty(new Event("click"), "isTrusted", { value: true });

class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
}

// ---------------------------------------------------------------- the store, the hosts, the endpoint

const COLUMNS = "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|";
const REGISTER = `# Participants of this instance\n\n${COLUMNS}\n| drafter-a | model endpoint | model-drafter-a | 200000 | — | draft text | Anthropic, USA | endpoint ep1 |\n`;
const RECORDING_ON = "---\nrecording: on\n---\n# Recording of conversations\n";
const failure = (name, fields = {}) => Object.assign(new Error(`${name} ${JSON.stringify(fields)}`), { name }, fields);
const sha = (n) => createHash("sha1").update(`commit ${n}`).digest("hex");

// One repository in memory whose default branch is `trunk`; every commit attempt is kept, and refused as Moved. `path` is the repository's address, by default the
// web address's owner and name.
function fakeRepo(web, files, path = web.replace(/^https:\/\/github\.com\//, "")) {
  const commits = new Map(), attempts = [];
  let made = 0;
  const commitOf = (tree) => { const id = sha(`${web}${++made}`); commits.set(id, tree); return id; };
  const head = commitOf(new Map(Object.entries(files)));
  const repository = { server: "github", origin: "https://github.com", path, web };
  return {
    attempts,
    host: {
      async repositoryInfo() { return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" }; },
      async readSnapshot(ref) {
        const tree = commits.get(ref === "trunk" ? head : ref);
        if (!tree) throw failure("NotFound", { what: ref });
        return { repository, ref, commit: ref === "trunk" ? head : ref, paths: [...tree.keys()].sort(), read: async (file) => (tree.has(file) ? tree.get(file) : null), blob: () => null };
      },
      async listPullRequests() { return []; },
      async commitFiles(change) { attempts.push(structuredClone(change)); throw failure("Moved", { head }); },
      async startWorkflow(...args) { attempts.push({ startWorkflow: args }); },
    },
  };
}

const INSTANCE_WEB = "https://github.com/alice/agent-m";
const PRODUCT_WEB = "https://github.com/alice/thesis-tool";
const ALIEN_WEB = "https://github.com/alice/AlienInvasion";
const ACCOUNT = "github.com/alice";
const LOAN = "A LOAN HAS A DUE DATE";
const SPEC = `# Thesis tool — Specification\n\n## 1. Lending\n\n**${LOAN}** *(SRC-alice)*\nEvery loan states the date by which the book is returned.\n*Check:* \`tests/loan.test.mjs\`\n`;
const PLANTED_PAGE = "PLANTED-PAGE-7D31 the page shows A LOAN HAS A DUE DATE";

registerStrategies("tests/prompt-bar-account-and-named-product.test.mjs:spec-changes", specStrategies);
registerStrategies("tests/prompt-bar-account-and-named-product.test.mjs:issue-handling", issueStrategies);
registerStrategies("tests/prompt-bar-account-and-named-product.test.mjs", { recipes: { "chapters-for-page": async () => [], "chapters-for-requirements": async () => [] } });

const CONVERSE = "You answer a person's message about the page they are looking at";
const CHANGE_REQUIREMENTS = "You change requirements of a product";

let requests = [];
const realFetch = globalThis.fetch;
function endpointAnswers(...drafts) {
  requests = [];
  const queue = [...drafts];
  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), body: String(init?.body ?? "") });
    const draft = queue.length > 1 ? queue.shift() : queue[0];
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ draft, answers: [] }) } }], usage: { prompt_tokens: 10, completion_tokens: 5 } }),
      { status: 200, headers: { "content-type": "application/json" } });
  };
}
test.afterEach(() => { globalThis.fetch = realFetch; });
const kindOfRequest = (request) => (request.body.includes(CHANGE_REQUIREMENTS) ? "change-requirements" : request.body.includes(CONVERSE) ? "converse" : "other");

// The page of the requirement A LOAN HAS A DUE DATE of thesis-tool, as a subject that gives no `source`.
const loanPage = () => ({ key: `requirement/name=${encodeURIComponent(LOAN)}/product=${encodeURIComponent(PRODUCT_WEB)}`, title: LOAN, entry: "requirements",
  paramsFor: () => ({ page: PLANTED_PAGE, requirements: [LOAN], version: "0123456789abcdef0123456789abcdef01234567" }),
  draftRoute: `draft/subject=${encodeURIComponent(`requirement/name=${encodeURIComponent(LOAN)}/product=${encodeURIComponent(PRODUCT_WEB)}`)}`, withhold: null, refuses: [] });

// A page of thesis-tool, the bar started on it: `alienToken` whether this browser keeps AlienInvasion's token; `recording` whether the instance records; `instancePath`
// the instance's repository address as its snapshot names it.
function page({ alienToken = true, recording = false, instancePath = "alice/agent-m", subject = loanPage() } = {}) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: new Storage() });
  const store = openStore("alice/agent-m");
  writeSetting(store, "endpoint:drafter-a", { kind: "openai-compatible", url: "https://models.example/v1", model: "model-drafter-a", key: "sk-fixture", place: "Anthropic, USA", context: 200000 });
  writeSetting(store, "github-token:alice/thesis-tool", { value: "github_pat_FIXTURE0123456789abcdef", name: "alice", expires: "2027-01-01" });
  if (alienToken) writeSetting(store, "github-token:alice/AlienInvasion", { value: "github_pat_ALIEN0123456789abcdefgh", name: "alice", expires: "2027-01-01" });
  const instance = fakeRepo(INSTANCE_WEB, { "SPEC.md": INSTANCE_SPEC, "docs/participants.md": REGISTER, ...(recording ? { "docs/conversation-recording.md": RECORDING_ON } : {}) }, instancePath);
  const product = fakeRepo(PRODUCT_WEB, { "SPEC.md": SPEC });
  const alien = fakeRepo(ALIEN_WEB, { "SPEC.md": "# Alien Invasion — Specification\n" });
  const target = document.createElement("div");
  const gone = [];
  startPromptBar(target, { page: "main", store, instance: { repository: "alice/agent-m", host: instance.host }, product: () => ({ address: PRODUCT_WEB, host: product.host }),
    products: () => [{ address: PRODUCT_WEB, host: product.host }, { address: ALIEN_WEB, host: alien.host }, { address: INSTANCE_WEB, host: instance.host }],
    subject: () => subject, explain: () => document.createElement("details"), go: (route, params) => gone.push({ route, params }) });
  return { store, instance, product, alien, target, gone };
}
const drawn = (it) => until(() => one(it.target, "instruction") !== undefined, "the bar is drawn");
async function sends(it, words) {
  one(it.target, "instruction").value = words;
  one(it.target, "send").dispatchEvent(trusted());
  await until(() => !one(it.target, "stop") || one(it.target, "stop").disabled, "the message has run");
  for (let turn = 0; turn < 20; turn += 1) await tick();
}
const statusOf = (it) => textOf(one(it.target, "status"));
const ABOUT = "About alice/AlienInvasion — named in your message.";

// ---------------------------------------------------------------- the person's account is the source

// TST-2026110814 · level: component · module: MOD-prompt-bar
// guards: UC-049; UC-019; THE PERSON WHO PROMPTS IS A SOURCE
// given: the page of A LOAN HAS A DUE DATE of thesis-tool, whose subject gives no `source`; the instance alice/agent-m on GitHub; an endpoint that answers the
//   conversation with a hand-over { kind change-requirements, works_on [A LOAN HAS A DUE DATE] } and the change of requirements with one candidate that changes it
// input: Send "the loan should say when it is overdue"
// expect: the conversation's request, then change-requirements'; the draft kept in the tab names the source github.com/alice — the account personAccount gives for the
//   instance — though the subject gave none
test("TST-2026110814: a hand-over run in the tab takes the person's account as its source, though the page's subject gives none", async () => {
  const candidate = { name: LOAN, rule: "Every loan states its due date and says when it is overdue.", check: "`tests/loan.test.mjs`", constrains: "product", passage: "the instruction", class: "change", of: LOAN };
  endpointAnswers({ answer: "I hand this on.", handOver: { kind: "change-requirements", works_on: [LOAN], task: "say when it is overdue" } }, { candidates: [candidate] });
  const subject = loanPage();
  const it = page({ subject });
  await drawn(it);
  await sends(it, "the loan should say when it is overdue");
  await until(() => one(it.target, "review"), "the draft of the hand-over is ready");
  assert.deepEqual(requests.slice(0, 2).map(kindOfRequest), ["converse", "change-requirements"]);
  assert.equal("source" in subject.paramsFor({}), false, "known positive: the subject gives no source");
  one(it.target, "review").dispatchEvent(new Event("click"));
  assert.equal(latestDraft(it.store, subject.key).params.source, ACCOUNT);
});

// TST-2026110815 · level: component · module: MOD-prompt-bar · MOD-spec-changes
// guards: UC-049; UC-019; THE PERSON WHO PROMPTS IS A SOURCE
// given: the same page and answers, but an instance whose snapshot names no owner — its repository's path is empty —, so that no account can be told
// input: Send "the loan should say when it is overdue"
// expect: one request only, the conversation's; the bar names the finding under THE PERSON WHO PROMPTS IS A SOURCE with what it requires — an instance repository whose
//   address names its owner —; no draft is kept and nothing is written
test("TST-2026110815: without an account the hand-over to change-requirements names what it requires and runs nothing", async () => {
  endpointAnswers({ answer: "I hand this on.", handOver: { kind: "change-requirements", works_on: [LOAN], task: "say when it is overdue" } }, { candidates: [] });
  const it = page({ instancePath: "" });
  await drawn(it);
  await sends(it, "the loan should say when it is overdue");
  await until(() => statusOf(it).includes("THE PERSON WHO PROMPTS IS A SOURCE"), "the finding is named");
  assert.deepEqual(requests.map(kindOfRequest), ["converse"]);
  assert.match(statusOf(it), /owner/);
  assert.equal(readTabValue(it.store, "prompt-bar:draft"), null);
  assert.deepEqual([...it.instance.attempts, ...it.product.attempts, ...it.alien.attempts], []);
});

// ---------------------------------------------------------------- a message that names another product (UC-049 3d)

// TST-2026110816 · level: component · module: MOD-prompt-bar
// guards: UC-049
// given: the page of A LOAN HAS A DUE DATE of thesis-tool; this browser keeps AlienInvasion's token; an endpoint that answers with an edit of docs/notes.md
// input: Send "write a specification in the Alien Invasion repo"; then a click on Review the draft
// expect: one request, of converse, whose page names AlienInvasion's address and none of the page shown — not its planted text —; the bar says
//   "About alice/AlienInvasion — named in your message."; Review the draft goes to the route draft with the product AlienInvasion named in go's `product` and a subject
//   for which the tab keeps the draft, whose parameters name no requirement of the page shown; nothing is written
test("TST-2026110816: a message that names another product is about that product, and its draft is reviewed there", async () => {
  endpointAnswers({ answer: "Here is a start.", edits: [{ path: "docs/notes.md", text: "# Notes\n" }] });
  const it = page();
  await drawn(it);
  await sends(it, "write a specification in the Alien Invasion repo");
  assert.deepEqual(requests.map(kindOfRequest), ["converse"]);
  assert.ok(requests[0].body.includes(ALIEN_WEB), "the page given names the product");
  assert.equal(requests[0].body.includes("PLANTED-PAGE-7D31"), false, "none of the page shown");
  assert.ok(statusOf(it).includes(ABOUT), statusOf(it));
  await until(() => one(it.target, "review"), "Review the draft is offered");
  one(it.target, "review").dispatchEvent(new Event("click"));
  const went = it.gone.at(-1);
  assert.equal(went.route, "draft");
  assert.equal(went.params.product, ALIEN_WEB);
  const draft = latestDraft(it.store, went.params.subject);
  assert.ok(draft, "the tab keeps the draft for the subject the route names");
  assert.equal("requirements" in draft.params, false);
  assert.deepEqual([...it.instance.attempts, ...it.product.attempts, ...it.alien.attempts], []);
});

// TST-2026110817 · level: component · module: MOD-prompt-bar
// guards: UC-049; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: the same page, and this browser keeps no token for AlienInvasion
// input: Send "write a specification in the Alien Invasion repo"; then a click on the link the bar offers
// expect: no request; the bar names https://github.com/alice/AlienInvasion and that nothing was sent; the link goes to the route add-product; nothing is written
test("TST-2026110817: without a token for the product named, nothing is sent and adding the product is linked", async () => {
  endpointAnswers({ answer: "never" });
  const it = page({ alienToken: false });
  await drawn(it);
  await sends(it, "write a specification in the Alien Invasion repo");
  assert.deepEqual(requests, []);
  assert.ok(statusOf(it).includes(ALIEN_WEB), statusOf(it));
  assert.match(statusOf(it), /Nothing was sent/);
  one(it.target, "add-product-link").dispatchEvent(trusted());
  assert.equal(it.gone.at(-1).route, "add-product");
  assert.deepEqual([...it.instance.attempts, ...it.product.attempts, ...it.alien.attempts], []);
});

// TST-2026110818 · level: component · module: MOD-prompt-bar
// guards: UC-049
// given: the same page; the products include the instance itself, alice/agent-m
// input: Send "what does the thesis tool page say?" (the page's own product); then "what does the agent m repo hold?" (the instance, which no message names this way);
//   then "and what of the shelf?" (none)
// expect: for each, one request of converse whose page is the page shown — its planted text —; no line "About …"
test("TST-2026110818: a message that names the page's own product, the instance, or none is about the page", async () => {
  for (const words of ["what does the thesis tool page say?", "what does the agent m repo hold?", "and what of the shelf?"]) {
    endpointAnswers({ answer: "Noted." });
    const it = page();
    await drawn(it);
    await sends(it, words);
    assert.deepEqual(requests.map(kindOfRequest), ["converse"], words);
    assert.ok(requests[0].body.includes("PLANTED-PAGE-7D31"), `${words}: the page shown is given`);
    assert.equal(statusOf(it).includes("About "), false, words);
  }
});

// TST-2026110819 · level: component · module: MOD-prompt-bar
// guards: UC-049; A RECORDED CONVERSATION IS KEPT WHERE IT WAS HELD; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// given: the same page; the instance records conversations; every commit is refused as Moved by the fixture
// input: Send "write a specification in the Alien Invasion repo"
// expect: the record is appended to AlienInvasion's repository — a commit attempted there under docs/conversations/ — and none to thesis-tool's or the instance's
test("TST-2026110819: with recording on, the message about a named product is recorded in that product's repository", async () => {
  endpointAnswers({ answer: "Noted." });
  const it = page({ recording: true });
  await drawn(it);
  await sends(it, "write a specification in the Alien Invasion repo");
  assert.ok(it.alien.attempts.length > 0, "a record is appended in the product named");
  assert.ok(it.alien.attempts.every((attempt) => attempt.files.every((file) => file.path.startsWith("docs/conversations/"))));
  assert.deepEqual([...it.instance.attempts, ...it.product.attempts], []);
});
