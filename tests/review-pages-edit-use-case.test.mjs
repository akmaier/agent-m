// MOD-review-pages' route use-case/<id>/edit for a use case (ITM-358), as the accepted text of docs/architecture/MOD-review-pages.md states
// it: "`<k>/<id>/edit` — the editor with live preview and the descriptor's marks … every save only on the blob the file … was opened on" —,
// and UC-018 steps 1 to 7 for a use case, 3b, 3c, 3e, 4a, 4b, 5a, 6b, 7a and UC-008 3a: the marks shown without blocking Save — a missing
// field of the use-case schema, a name under `realises` that matches no requirement —; Save through saveFile on the blob the editor was opened on;
// a changed `id` disables Save and shows the reason; a refused save keeps the edit beside the newer text; without a token GitHub's editor opens
// with the text on the clipboard; on GitLab without a token there is no Save and the token's step is linked.
// Run: node --test tests/review-pages-edit-use-case.test.mjs
//
// Module: MOD-review-pages
// Guards: UC-018; UC-008; EDITS ARE PREPARED ON THE DASHBOARD; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT; AN EDITED FILE KEEPS ITS IDENTIFIER; A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN; WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; NO TEXT TRAVELS IN A URL; A GITLAB PRODUCT IS WRITTEN WITH A TOKEN; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// Level: unit
//
// This imports the browser harness of tests/review-pages-use-cases.test.mjs unchanged (its document and its localStorage), and brings the
// repository the way the tests of that route do: a Host of the tests' own over one repository in memory with a history, keeping to
// MOD-repository-hosts' interface; every call recorded. The real MOD-approvals, MOD-artifact-edits, MOD-documents, MOD-trace-graph and
// MOD-browser-store run as they are. Nothing reaches the network. Where the module file leaves a reading open, the test states the one it takes,
// and the pull request names it:
//   - The address of the editor is the route `use-case` with the id and the parameter `edit`: #use-case/id=<id>/edit=1; the page of one use case
//     links to it with "Edit". The editor is MOD-markdown-render's openEditor: a textarea, the preview, the marks as the rows of an <ol class="marks">,
//     its own Save button, and a <div class="newer"> beside a refused edit.
//   - A mark is a row of the editor in the compiler's one form; a missing field of the schema is documentFindings' mark, a name under `realises`
//     that matches no requirement the finding of MOD-trace-graph's graphFindings (rule A USE CASE REALISES NAMED REQUIREMENTS). The marks of the graph
//     are computed after the text changes and appear in the rows a few turns later.
//   - A changed `id` disables Save (its button's `disabled` is true) and the page says why in <p class="id-changed">, naming the identifier to keep;
//     a text with the opened `id` enables it again.
//   - After a save the page says in <p class="status"> what the use case is now — "open", or "changed since acceptance" — from the records.
//   - Without a token on GitHub the editor has no Save; <a class="github-page"> leads to GitHub's editor of the file at its path, its address
//     holding no text, and a click on it puts the edited text (with a closing line break) on the clipboard, navigator.clipboard.writeText.
//   - On GitLab without a token there is no Save and <a class="token-step"> links #add-product.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import "./review-pages-use-cases.test.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const { openStore, writeSetting } = await import("../src/browser-store/index.mjs");
const pages = await import("../src/review-pages/index.mjs").catch((error) => ({ error }));
const route = pages.view?.routes.find((candidate) => candidate.name === "use-case");

// ---------------------------------------------------------------- the product

const text = (...lines) => `${lines.join("\n")}\n`;
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const failure = (name, message, fields = {}) => Object.assign(new Error(message), { name }, fields);
const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/thesis-tool", web: "https://github.com/alice/thesis-tool" };
const ON_GITLAB = { server: "gitlab", origin: "https://gitlab.example.org", path: "team/product", web: "https://gitlab.example.org/team/product" };
const TOKEN = { value: "github_pat_ALICEthesisTOOL0123456789abcdef", name: "Agent M · thesis-tool", expires: "2027-01-01" };

const RULE = "A LOAN HAS A DUE DATE";
const SPEC = text("# Thesis tool — Specification", "", "## Lending", "", `**${RULE}** *(Product Owner)*`, "Every loan states the date by which the book is returned.",
  "*Check:* `tests/loan.test.mjs`");
const useCase = (id, title, goal, realises = [RULE]) => text("---", `id: ${id}`, `title: ${title}`, "area: lending", "actors:", "  - Member", "realises:",
  ...realises.map((name) => `  - ${name}`), "---", `# ${id} ${title}`, "", `**Goal.** ${goal}`);
const P41 = "docs/use-cases/UC-041-check-out-a-book.md", P42 = "docs/use-cases/UC-042-extend-a-loan.md";
const UC41 = useCase("UC-041", "Check out a book", "The member borrows a book at the desk.");
const UC42 = useCase("UC-042", "Extend a loan", "The member extends a loan once.");
const recordOf = (id, path, body) => [`docs/approvals/${id}-${blobOf(body).slice(0, 12)}.md`, text("kind: use-case", `file: ${path}`, `blob: ${blobOf(body)}`)];
// UC-041 open, UC-042 accepted.
const STEPS = [
  { "README.md": "# Thesis tool\n", "SPEC.md": SPEC, [P41]: UC41, [P42]: UC42 },
  Object.fromEntries([recordOf("UC-042", P42, UC42)]),
];

// ---------------------------------------------------------------- the fake host

function fakeHost({ repository = ON_GITHUB, refuse = null } = {}) {
  const calls = [], commits = new Map();
  let made = 0, head = null;
  const commitOf = (tree, parent) => {
    const sha = createHash("sha1").update(`commit ${++made}`).digest("hex");
    commits.set(sha, { tree, parent, date: `2026-10-0${made}T10:00:00Z` });
    return sha;
  };
  for (const files of STEPS) head = commitOf(new Map([...(head ? commits.get(head).tree : []), ...Object.entries(files)]), head);
  const snapshotAt = (sha) => {
    const { tree } = commits.get(sha);
    return { repository, ref: sha, commit: sha, paths: [...tree.keys()].sort(), read: async (path) => (tree.has(path) ? tree.get(path) : null),
      blob: (path) => (tree.has(path) ? blobOf(tree.get(path)) : null) };
  };
  return {
    head: () => head,
    files: () => Object.fromEntries(commits.get(head).tree),
    writes: () => calls.filter((call) => call.fn === "commitFiles"),
    land(changed, removed = []) {
      const tree = new Map([...commits.get(head).tree, ...Object.entries(changed)]);
      for (const path of removed) tree.delete(path);
      head = commitOf(tree, head);
    },
    host: {
      async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: true, archived: false, description: "" }; },
      async readSnapshot(ref) {
        if (ref === "main") return { ...snapshotAt(head), ref };
        if (commits.has(ref)) return snapshotAt(ref);
        throw failure("NotFound", `${ref} was not found`, { what: ref });
      },
      async readHistory(path, { ref = "main", limit } = {}) {
        const found = [];
        for (let sha = ref === "main" ? head : ref; sha; sha = commits.get(sha).parent) {
          const here = commits.get(sha), before = here.parent ? commits.get(here.parent).tree.get(path) : undefined;
          if (here.tree.get(path) !== before) found.push({ commit: sha, parents: here.parent ? [here.parent] : [], date: here.date, message: "", author: { account: null, name: "x" }, changes: [] });
        }
        return limit ? found.slice(0, limit) : found;
      },
      async commitFiles(change) {
        calls.push({ fn: "commitFiles", change: structuredClone(change) });
        if (refuse) throw refuse;
        if (change.branch !== "main" || change.expectedHead !== head) throw failure("Moved", "the branch moved", { head });
        head = commitOf(new Map([...commits.get(head).tree, ...change.files.map((f) => [f.path, f.text])]), head);
        return { commit: head, url: `${repository.web}/commit/${head}` };
      },
    },
  };
}

// ---------------------------------------------------------------- the page

const clipboard = [];
Object.defineProperty(globalThis, "navigator", { configurable: true, value: { clipboard: { writeText: async (value) => { clipboard.push(value); } } } });
async function edit(fake, id, { token = true, gitlab = false } = {}) {
  assert.ok(route, `the route use-case: ${pages.error?.message}`);
  const store = openStore(token ? "alice/agent-m" : "nobody/agent-m");
  if (token) writeSetting(store, gitlab ? "gitlab-token:gitlab.example.org/team/product" : "github-token:alice/thesis-tool", TOKEN);
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, { page: "review", instance: { repository: "alice/agent-m", host: fake.host }, store, go() {},
    product: { address: (gitlab ? ON_GITLAB : ON_GITHUB).web, kind: gitlab ? "gitlab" : "github", host: fake.host } }, { id, edit: "1" });
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
  for (let turn = 0; turn < 400; turn++) {
    if (condition()) return;
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.fail(`waited for ${what}`);
}
const areaOf = (target) => find(target, (node) => node.localName === "textarea")[0];
const saveOf = (target) => find(target, (node) => node.localName === "button" && node.textContent === "Save")[0];
const marksOf = (target) => byClass(target, "ol", "marks")[0]?.textContent ?? "";
// The person types: the text area holds the new text, and the input event follows.
function type(target, body) {
  const area = areaOf(target);
  area.value = body;
  area.dispatchEvent(new Event("input"));
}

// ---------------------------------------------------------------- Save

// guards: EDITS ARE PREPARED ON THE DASHBOARD; A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: a token; UC-041, open, and UC-042, accepted; the editor of each opened with its text
// input: the text of each changed in the text area; nothing written so far; a click on Save, for each
// expect: before the click nothing is written; after it one commit on main holding that one file with the edited text; the page says the use case
//         is now "open" for UC-041 and "changed since acceptance" for UC-042
test("use-case/<id>/edit — an edit is saved in one commit, and the use case is open or changed afterwards", async () => {
  const fake = fakeHost();
  for (const [id, path, before, status] of [["UC-041", P41, UC41, "open"], ["UC-042", P42, UC42, "changed since acceptance"]]) {
    const target = await edit(fake, id);
    assert.equal(areaOf(target).value, before, "the editor opens on the file's text");
    // The person's text has no closing line break for UC-042; the file is saved with one.
    const edited = before.replace("once.", "once, and says when.").replace("desk.", "desk, for a week.");
    type(target, id === "UC-042" ? edited.slice(0, -1) : edited);
    assert.equal(fake.writes().filter((write) => write.change.files[0].path === path).length, 0, "nothing is written before the click");
    const heads = fake.writes().length;
    click(saveOf(target));
    await until(() => fake.writes().length === heads + 1, "the commit");
    const [{ change }] = fake.writes().slice(-1);
    assert.deepEqual(change.files, [{ path, text: edited }], `${id}: one file, the edited text, with its closing line break`);
    await until(() => byClass(target, "p", "status").length === 1, "the status");
    assert.equal(byClass(target, "p", "status")[0].textContent, status, id);
    assert.equal(fake.files()[path], edited);
    if (id === "UC-041") {
      // The editor goes on: a second edit is saved on the blob the first one made.
      const again = edited.replace("a week.", "a fortnight.");
      type(target, again);
      click(saveOf(target));
      await until(() => fake.writes().length === heads + 2, "the second commit");
      assert.equal(fake.files()[path], again, "the second save is made on the blob of the first");
    }
  }
});

// ---------------------------------------------------------------- marks

// guards: EDITS ARE PREPARED ON THE DASHBOARD; A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION
// given: the editor of UC-041 with a token
// input: the text changed so that its `title` is missing and a name under `realises` matches no requirement
// expect: the rows of the editor mark the missing field at once, and the unknown name AN UNKNOWN RULE a few turns later; Save is still
//         offered, not disabled
test("use-case/<id>/edit — marks are shown and Save is still offered", async () => {
  const target = await edit(fakeHost(), "UC-041");
  assert.equal(marksOf(target).includes("AN UNKNOWN RULE"), false, "known positive: the file as it stands has no such mark");
  type(target, useCase("UC-041", "Check out a book", "The member borrows a book at the desk.", [RULE, "AN UNKNOWN RULE"]).replace("title: Check out a book\n", ""));
  assert.match(marksOf(target), /title/, "the missing field is marked at once");
  await until(() => marksOf(target).includes("AN UNKNOWN RULE"), "the mark of the unknown name");
  assert.match(marksOf(target), /title/, "the missing field stays marked");
  assert.ok(saveOf(target), "Save is offered");
  assert.notEqual(saveOf(target).disabled, true, "Save is not disabled");
});

// ---------------------------------------------------------------- the identifier

// guards: AN EDITED FILE KEEPS ITS IDENTIFIER
// given: the editor of UC-041 with a token
// input: the text changed so that its `id` is UC-099; a click on the disabled Save; then the text changed back to UC-041
// expect: with UC-099 Save is disabled and the page says why, naming UC-041 and UC-099; the click writes nothing, the refusal says it is the
//         identifier; with UC-041 it is enabled again and the reason is gone
test("use-case/<id>/edit — a changed id disables Save and shows the reason", async () => {
  const fake = fakeHost();
  const target = await edit(fake, "UC-041");
  assert.notEqual(saveOf(target).disabled, true, "known positive: Save is enabled for the opened id");
  type(target, UC41.replace("id: UC-041", "id: UC-099"));
  await until(() => saveOf(target).disabled === true, "Save disabled");
  assert.match(byClass(target, "p", "id-changed")[0].textContent, /UC-041/);
  assert.match(byClass(target, "p", "id-changed")[0].textContent, /UC-099/, "the reason names the identifier the text carries");
  // Even a click that reaches the handler writes nothing: the save itself refuses a changed identifier.
  click(saveOf(target));
  await until(() => /identifier/.test(byClass(target, "p", "result")[0]?.textContent ?? ""), "the refusal");
  assert.equal(fake.writes().length, 0, "nothing written for a changed identifier");
  type(target, UC41.replace("a book", "the book"));
  await until(() => saveOf(target).disabled !== true, "Save enabled again");
  assert.equal(byClass(target, "p", "id-changed")[0]?.textContent ?? "", "");
  assert.equal(fake.writes().length, 0, "nothing written");
});

// ---------------------------------------------------------------- changed meanwhile

// guards: A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT
// given: the editor of UC-041 opened on its text; another writer's commit then changes the file
// input: the text changed; a click on Save
// expect: nothing written by the page; the edit still in the text area; the newer version beside it, with the difference
test("use-case/<id>/edit — changed meanwhile: nothing written, the edit kept beside the newer text", async () => {
  const fake = fakeHost();
  const target = await edit(fake, "UC-041");
  const newer = UC41.replace("at the desk.", "at the desk, or online.");
  fake.land({ [P41]: newer });
  const edited = UC41.replace("borrows", "borrows or reserves");
  type(target, edited);
  click(saveOf(target));
  await until(() => byClass(target, "div", "newer")[0]?.textContent.includes("or online."), "the newer text beside the edit");
  assert.equal(fake.writes().length, 0, "nothing written");
  assert.equal(areaOf(target).value, edited, "the edit stays in the editor");
  assert.ok(byClass(target, "div", "newer")[0].textContent.includes("borrows or reserves"), "the edit is shown too");
  assert.equal(fake.files()[P41], newer);
});

// ---------------------------------------------------------------- without a token

// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; NO TEXT TRAVELS IN A URL
// given: a GitHub product and no token stored; the editor of UC-041
// input: the text changed; a click on the link to GitHub's editor
// expect: no Save; a link to GitHub's editor of the file at its path, its address holding no text; the click puts the edited text on the clipboard;
//         nothing written
test("use-case/<id>/edit — without a token: a link that holds no text, and the text for the clipboard", async () => {
  const fake = fakeHost();
  const target = await edit(fake, "UC-041", { token: false });
  assert.equal(saveOf(target), undefined, "no Save");
  const link = byClass(target, "a", "github-page")[0];
  assert.ok(link, "a link to GitHub's editor");
  assert.equal(link.getAttribute("href"), `https://github.com/alice/thesis-tool/edit/main/${P41}`);
  const edited = UC41.replace("borrows", "borrows or reserves");
  type(target, edited);
  clipboard.length = 0;
  click(link);
  await until(() => clipboard.length === 1, "the text on the clipboard");
  assert.equal(clipboard[0], edited);
  for (const part of ["borrows", "Goal", "Check out"]) assert.ok(!link.getAttribute("href").includes(part), `the address holds no "${part}"`);
  assert.equal(fake.writes().length, 0, "nothing written");
});

// guards: A GITLAB PRODUCT IS WRITTEN WITH A TOKEN
// given: a product on a GitLab server and no token of its own stored
// input: the editor of UC-041
// expect: the editor, with the text; no Save; no link to a GitHub page; the token's step, #add-product, linked
test("use-case/<id>/edit — a GitLab product without a token: no Save, and the token's step linked", async () => {
  const target = await edit(fakeHost({ repository: ON_GITLAB }), "UC-041", { token: false, gitlab: true });
  assert.equal(areaOf(target).value, UC41, "the editor shows the text");
  assert.equal(saveOf(target), undefined, "no Save");
  assert.equal(find(target, (node) => node.localName === "a" && /github\.com/.test(node.getAttribute("href") ?? "")).length, 0, "no GitHub page");
  assert.equal(find(target, (node) => node.localName === "a" && node.getAttribute("href") === "#add-product").length >= 1, true, "the token's step");
});
