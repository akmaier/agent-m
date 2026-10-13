// MOD-review-pages' editing of an open SPEC entry in place (ITM-397), as the accepted text of docs/architecture/MOD-review-pages.md states it: "an open SPEC entry saved in
// place, in its own queue (UC-006 3a, UC-018 1a); every save only on the blob the file or section was opened on", with the SPEC-entry descriptor's `save` being `entry`:
// Edit on an open entry opens the editor on its proposal, the blob noted, and Save goes through MOD-spec-changes' saveEntry into the entry's own queue; a refused save keeps
// the edit beside the newer text; an entry no longer open is named with its state; without a token GitHub's pages open per file. The data are the use cases' own: UC-006 3a
// ("The reviewer wants different wording … edits the proposal … and presses Save; the entry is then shown from step 2 with the new text") and UC-018 1a ("the entry itself is
// saved directly, because it is already a proposal; no second queue is created"); the requirement EXPORT IS A PDF is UC-019's example.
// Run: node --test tests/review-pages-edit-entry.test.mjs
//
// This imports the browser harness of tests/review-pages-use-cases.test.mjs unchanged. The product is a fixture behind a Host of the tests' own (repositoryInfo with canWrite,
// readSnapshot, readHistory, commitFiles on the head that was read, else `Moved`); the real MOD-markdown-render (its editor, through openEditor only), MOD-spec-changes,
// MOD-spec-document and MOD-trace-graph run as they are. Where the module file leaves a reading open, the test states the one it takes, and the pull request names it:
//   - The address is the entry's with the part `edit=1` — #spec-entry/id=spec-2026-03-01_sample-01/edit=1 —; the entry's page offers <a class="edit-link"> there only while the
//     entry is open (not decided, stale or waiting). The page holds the editor on the proposal, <textarea class="why"> (empty: the rationale's Why is not a field the entry
//     view gives), <ul class="impact"> against the section that holds now, and after a save <p class="entry"> linking the commit and the entry.
//   - A save with an empty Why is not sent. Without a token the person of the edit is "anonymous".

import "./review-pages-use-cases.test.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const { openStore, writeSetting } = await import("../src/browser-store/index.mjs");
const pages = await import("../src/review-pages/index.mjs").catch((error) => ({ error }));
const route = pages.view?.routes.find((candidate) => candidate.name === "spec-entry");

// ---------------------------------------------------------------- the product

const text = (...lines) => `${lines.join("\n")}\n`;
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const failure = (name, message, fields = {}) => Object.assign(new Error(message), { name }, fields);
const GITHUB = { server: "github", origin: "https://github.com", path: "alice/thesis-tool", web: "https://github.com/alice/thesis-tool" };
const GITLAB = { server: "gitlab", origin: "https://gitlab.example.org", path: "alice/thesis-tool", web: "https://gitlab.example.org/alice/thesis-tool" };
const TOKEN = { value: "github_pat_ALICEthesisTOOL0123456789abcdef", name: "Agent M · thesis-tool", expires: "2027-01-01" };
const EXPORT = "EXPORT IS A PDF", SHELF = "A BOOK IS SHELVED";
const LENDING = text("## 1. Lending", "", `**${EXPORT}** *(Product Owner)*`, "Every export is a PDF.", "*Check:* `tests/export.test.mjs`", "",
  `**${SHELF}** *(Product Owner)*`, "Every book stands on a shelf.", "*Check:* `tests/shelf.test.mjs`", "");
const HEAD = text("# Thesis tool — Specification", "");
const SPEC = HEAD + LENDING;
const HEADING = "## 1. Lending";
const QUEUE = "docs/spec-freigaben/2026-03-01_sample";
const PROPOSAL = LENDING.replace("Every export is a PDF.", "Every export is a PDF file.");
const PROPOSAL2 = LENDING.replace("Every book stands on a shelf.", "Every book stands on one shelf.");
const entryFiles = (decided = false) => ({
  [`${QUEUE}/index.md`]: text("# SPEC approvals — queue 2026-03-01 · sample", "", "**Zieldatei aller Einträge:** `SPEC.md`", "",
    "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|", `| 01 | \`SPEC.md\` | ${HEADING} | — | — |`),
  [`${QUEUE}/entscheidungen.md`]: text("# Decisions — queue 2026-03-01 sample", "", "| Date | Entry | Decision | Reference |", "|---|---|---|---|",
    ...(decided ? ["| 2026-03-01 10:00 UTC | 1 | uebernommen | approval:spec-2026-03-01_sample-01-aaaaaaaaaaaa.md |"] : [])),
  [`${QUEUE}/01-lending.md`]: PROPOSAL,
  [`${QUEUE}/01-lending.begruendung.md`]: text(`# ${HEADING.slice(3)}: ${EXPORT}`, "", "**The change.** Changes the text of the section.", "", "**Why.** The wording is clearer.", "",
    "**Impact list.**", `- ${EXPORT}: changed; nothing names it.`, "", "**Origin.** an edit of the SPEC; saved by Agent M · thesis-tool."),
});
const FILES = { "README.md": "# Thesis tool\n", "SPEC.md": SPEC, ...entryFiles() };
const ENTRY = "spec-2026-03-01_sample-01";

// ---------------------------------------------------------------- the fake host

function fakeHost(files = FILES, { repository = GITHUB, canWrite = true } = {}) {
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
    return { repository, ref, commit: sha, paths: [...tree.keys()].sort(), read: async (path) => (tree.has(path) ? tree.get(path) : null),
      blob: (path) => (tree.has(path) ? blobOf(tree.get(path)) : null) };
  };
  return {
    files: () => Object.fromEntries(commits.get(head).tree), head: () => head,
    writes: () => calls.filter((call) => call.fn === "commitFiles").map((call) => call.change),
    land(changed) { head = commitOf(new Map([...commits.get(head).tree, ...Object.entries(changed)]), head); },
    host: {
      async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite, archived: false, description: "" }; },
      async readSnapshot(ref) {
        if (ref === "main") return snapshotAt(head, "main");
        if (commits.has(ref)) return snapshotAt(ref, ref);
        throw failure("NotFound", `${ref} was not found`);
      },
      async readHistory() { return []; },
      async commitFiles(change) {
        calls.push({ fn: "commitFiles", change: structuredClone(change) });
        if (change.branch !== "main" || change.expectedHead !== head) throw failure("Moved", "the branch moved", { head });
        head = commitOf(new Map([...commits.get(head).tree, ...change.files.map((file) => [file.path, file.text])]), head);
        return { commit: head, url: `${repository.web}/commit/${head}` };
      },
    },
  };
}

// ---------------------------------------------------------------- the page

async function showEdit(fake, params, { token = true, repository = GITHUB } = {}) {
  assert.ok(route, `the route: ${pages.error?.message}`);
  const store = openStore(token ? "alice/agent-m" : "nobody/agent-m");
  if (token) writeSetting(store, repository.server === "gitlab" ? "gitlab-token:gitlab.example.org/alice/thesis-tool" : "github-token:alice/thesis-tool", TOKEN);
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, { page: "review", instance: { repository: "alice/agent-m", host: fake.host }, store, go() {},
    product: { address: repository.web, kind: repository.server, host: fake.host } }, params);
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
// The editor's text area is the first one on the page; the Why field is the one of its class.
const areaOf = (target) => find(target, (node) => node.localName === "textarea" && !node.className.split(" ").includes("why"))[0];
const whyOf = (target) => byClass(target, "textarea", "why")[0];
const saveOf = (target) => find(target, (node) => node.localName === "button" && node.textContent === "Save")[0];
function type(target, value) {
  const area = areaOf(target);
  area.value = value;
  area.dispatchEvent(new Event("input"));
}
const withWhy = (target, why = "Because it is clearer.") => { whyOf(target).value = why; };
const proposals = (fake) => fake.writes().flatMap((change) => change.files).filter((file) => /\/\d\d-[^/]*\.md$/.test(file.path) && !file.path.endsWith(".begruendung.md"));

const EDIT = { id: ENTRY, edit: "1" };
const withDecision = () => entryFiles(true);

// TST-397001 · level: unit · module: MOD-review-pages
// guards: UC-006; UC-018; A SPEC EDIT IS SAVED AS A PROPOSAL; EDITS ARE PREPARED ON THE DASHBOARD
// given: the open entry 01 of the queue 2026-03-01_sample, proposing the section "1. Lending" with the requirement EXPORT IS A PDF reworded
// input: the page of the entry
// expect: a link "Edit" to #spec-entry/id=spec-2026-03-01_sample-01/edit=1; nothing written
test("spec-entry/<id> — an open entry offers Edit", async () => {
  const fake = fakeHost();
  const target = await showEdit(fake, { id: ENTRY });
  const links = byClass(target, "a", "edit-link");
  assert.equal(links.length, 1);
  assert.equal(links[0].getAttribute("href"), `#spec-entry/id=${ENTRY}/edit=1`);
  assert.equal(fake.writes().length, 0);
});

// TST-397002 · level: unit · module: MOD-review-pages
// guards: UC-006; A SPEC EDIT IS SAVED AS A PROPOSAL; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: the same entry
// input: the edit page of the entry
// expect: the editor holds the proposal byte for byte, with a Why field and an impact list that names EXPORT IS A PDF as changed against the section that holds now when the
//         text is edited; nothing written
test("spec-entry/<id>/edit — the editor opens on the entry's proposal, with a Why field and the impact list; nothing is written", async () => {
  const fake = fakeHost();
  const target = await showEdit(fake, EDIT);
  assert.equal(areaOf(target).value, PROPOSAL);
  assert.ok(whyOf(target), "a Why field");
  assert.equal(byClass(target, "ul", "impact")[0].textContent, `${EXPORT} — changed`, "against the section that holds now");
  type(target, PROPOSAL.replace("a PDF file.", "a PDF file, always."));
  assert.match(byClass(target, "ul", "impact")[0].textContent, new RegExp(`${EXPORT} — changed`));
  assert.equal(fake.writes().length, 0);
});

// TST-397003 · level: unit · module: MOD-review-pages
// guards: UC-006; UC-018; A SPEC EDIT IS SAVED AS A PROPOSAL; ONE CLICK PER DECISION
// given: the editor on the open entry, the proposal reworded again, and a Why
// input: a click on Save
// expect: one commit holding the entry's own proposal file, byte for byte as edited, and its rationale — no index, no new queue folder —; SPEC.md untouched; the page links the commit
//         and the entry
test("spec-entry/<id>/edit — Save writes the entry in its own queue and makes no new one", async () => {
  const fake = fakeHost();
  const target = await showEdit(fake, EDIT);
  const edited = PROPOSAL.replace("a PDF file.", "a PDF file, always.");
  type(target, edited);
  withWhy(target, "Always is what the reviewer wants.");
  click(saveOf(target));
  await until(() => byClass(target, "p", "entry").length === 1, "the saved entry");
  assert.equal(fake.writes().length, 1, "one commit");
  const [change] = fake.writes();
  assert.deepEqual(change.files.map((file) => file.path).sort(), [`${QUEUE}/01-lending.begruendung.md`, `${QUEUE}/01-lending.md`]);
  assert.equal(change.files.find((file) => file.path === `${QUEUE}/01-lending.md`).text, edited);
  assert.match(change.files.find((file) => file.path.endsWith(".begruendung.md")).text, /Always is what the reviewer wants\./);
  assert.ok(!Object.keys(fake.files()).some((path) => path.startsWith("docs/spec-freigaben/") && !path.startsWith(QUEUE)), "no second queue");
  const hrefs = find(byClass(target, "p", "entry")[0], (node) => node.localName === "a").map((node) => node.getAttribute("href"));
  assert.ok(hrefs.includes(`https://github.com/alice/thesis-tool/commit/${fake.head()}`), String(hrefs));
  assert.ok(hrefs.includes(`#spec-entry/id=${ENTRY}`), String(hrefs));
});

// TST-397004 · level: unit · module: MOD-review-pages
// guards: UC-018; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT
// given: the editor on the open entry with an edit and a Why; then another writer changes the entry's proposal
// input: a click on Save
// expect: nothing written; the edit stays in the text area; the newer proposal is beside it
test("spec-entry/<id>/edit — a save the proposal changed under is refused, and the edit stays beside the newer text", async () => {
  const fake = fakeHost();
  const target = await showEdit(fake, EDIT);
  const edited = PROPOSAL.replace("a PDF file.", "a PDF file, always.");
  type(target, edited);
  withWhy(target);
  fake.land({ [`${QUEUE}/01-lending.md`]: PROPOSAL2 });
  click(saveOf(target));
  await until(() => byClass(target, "div", "newer")[0].textContent.includes("one shelf."), "the newer text");
  assert.equal(fake.writes().length, 0);
  assert.equal(areaOf(target).value, edited);
});

// TST-397005 · level: unit · module: MOD-review-pages
// guards: UC-006; A SPEC EDIT IS SAVED AS A PROPOSAL
// given: an entry the queue's decisions have accepted (in SPEC)
// input: the page of the entry, and its edit page
// expect: the entry's page offers no Edit; the edit page says the entry is not open, names the state "in SPEC" and opens no editor; nothing written
test("spec-entry/<id> — an accepted entry offers no Edit, and its edit page names its state", async () => {
  const fake = fakeHost({ ...FILES, ...withDecision() });
  const page = await showEdit(fake, { id: ENTRY });
  assert.match(byClass(page, "span", "badge")[0].textContent, /in SPEC/, "known positive: the entry is accepted");
  assert.equal(byClass(page, "a", "edit-link").length, 0);
  const target = await showEdit(fake, EDIT);
  assert.match(target.textContent, /not open[^]*in SPEC/);
  assert.equal(find(target, (node) => node.localName === "textarea").length, 0, "no editor");
  assert.equal(fake.writes().length, 0);
});

// TST-397006 · level: unit · module: MOD-review-pages
// guards: UC-006; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
// given: the editor on the open entry with an edit and a Why; then the entry is accepted meanwhile
// input: a click on Save
// expect: nothing written; the page says the entry is no longer open and names its state, in SPEC; the edit stays
test("spec-entry/<id>/edit — an entry accepted meanwhile is named with its state and the edit stays", async () => {
  const fake = fakeHost();
  const target = await showEdit(fake, EDIT);
  const edited = PROPOSAL.replace("a PDF file.", "a PDF file, always.");
  type(target, edited);
  withWhy(target);
  fake.land(withDecision());
  click(saveOf(target));
  await until(() => /no longer open/.test(byClass(target, "p", "result")[0]?.textContent ?? ""), "the answer");
  assert.match(byClass(target, "p", "result")[0].textContent, /in SPEC/);
  assert.equal(fake.writes().length, 0);
  assert.equal(areaOf(target).value, edited);
});

// TST-397007 · level: unit · module: MOD-review-pages
// guards: UC-018; A SPEC EDIT IS SAVED AS A PROPOSAL
// given: the editor with an edit and no Why
// input: a click on Save
// expect: nothing written; the editor says a Why is needed
test("spec-entry/<id>/edit — a save without a Why is not sent", async () => {
  const fake = fakeHost();
  const target = await showEdit(fake, EDIT);
  type(target, PROPOSAL.replace("a PDF file.", "a PDF file, always."));
  click(saveOf(target));
  await until(() => /Why/.test(byClass(target, "p", "result")[0]?.textContent ?? ""), "the answer");
  assert.equal(fake.writes().length, 0);
});

// TST-397008 · level: unit · module: MOD-review-pages
// guards: UC-006; WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; NO TEXT TRAVELS IN A URL
// given: a GitHub product whose host cannot write, the editor with an edit and a Why
// input: a click on Save
// expect: nothing written; GitHub's page for each of the entry's two files, none with the text in its address
test("spec-entry/<id>/edit — without a token on GitHub, GitHub's pages open per file", async () => {
  const fake = fakeHost(FILES, { canWrite: false });
  const target = await showEdit(fake, EDIT, { token: false });
  type(target, PROPOSAL.replace("a PDF file.", "a PDF file, always."));
  withWhy(target);
  click(saveOf(target));
  await until(() => byClass(target, "a", "github-page").length === 2, "GitHub's pages");
  assert.equal(fake.writes().length, 0);
  for (const page of byClass(target, "a", "github-page")) assert.ok(!decodeURIComponent(page.getAttribute("href")).includes("always"), "no text in the address");
});

// TST-397009 · level: unit · module: MOD-review-pages
// guards: UC-018; A GITLAB PRODUCT IS WRITTEN WITH A TOKEN
// given: a GitLab product, no token stored
// input: the edit page of the entry
// expect: the proposal shown, no editor and no Save; the token's step linked; nothing written
test("spec-entry/<id>/edit — on GitLab without a token there is no Save", async () => {
  const fake = fakeHost(FILES, { repository: GITLAB, canWrite: false });
  const target = await showEdit(fake, EDIT, { token: false, repository: GITLAB });
  assert.match(target.textContent, /PDF file/, "known positive: the proposal is shown");
  assert.match(find(target, (node) => node.localName === "h2")[0].textContent, /^Edit /, "it is the edit page");
  assert.equal(find(target, (node) => node.localName === "textarea").length, 0);
  assert.equal(find(target, (node) => node.localName === "button" && node.textContent === "Save").length, 0);
  assert.equal(find(target, (node) => node.localName === "a" && node.getAttribute("href") === "#add-product").length >= 1, true);
  assert.equal(fake.writes().length, 0);
});
