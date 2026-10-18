// MOD-review-pages' lists, file pages and Review all pages of the use cases, the architecture decisions, the module files and the SPEC
// change entries (ITM-874), as the accepted text of docs/architecture/MOD-review-pages.md states them — `<k>` "every file of the kind with
// its status — open, accepted, changed since acceptance", `<k>/<id>` one file, `<k>/all` "Review all" — and UC-008 3e: "Review all opens one
// page with every open or changed use case in sequence". The page's style colours a status by the class `b-<status>` of its badge
// (docs/assets/style.css) and a button by `btn primary`; this file asserts that the pages write those classes. A regression: the pages wrote
// `badge accepted` and a link of the class `review-all`, which no rule styles, so every status showed grey and Review all as plain text.
// Run: node --test tests/review-pages-status-colour.test.mjs
//
// Module: MOD-review-pages
// Guards: UC-008; UC-006; UC-023; SEVERAL FILES ARE ACCEPTED IN ONE CLICK; STATUS IS DERIVED FROM THE RECORDS
// Level: unit
//
// This imports the browser harness of tests/review-pages-harness.mjs unchanged. The repository is a Host of the tests' own over one repository
// in memory with a history, keeping to MOD-repository-hosts' interface. The real MOD-approvals, MOD-spec-changes, MOD-documents and
// MOD-browser-store run as they are. Nothing reaches the network. Readings the test takes where the module file leaves one open:
//   - A status badge is the <span> whose class holds "badge". It carries exactly the two classes "badge" and "b-<class>", the class named in the
//     test. The class of a status is its name — open, accepted, changed, approved, stale —; the SPEC entry state "in SPEC" is the class of
//     the style rule that colours it, `b-applied` (docs/assets/style.css: `.b-accepted, .b-applied`).
//   - Review all on a list is an <a> with the href `#<route>/id=all` whose classes include "btn" and "primary", and whose text is
//     "Review all N not accepted", N the number of files that page of Review all shows (the files of the kind, or, for the decisions, of
//     the whole architecture) whose status is not accepted.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import "./review-pages-harness.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const { openStore, writeSetting } = await import("../src/browser-store/index.mjs");
const { sectionText } = await import("../src/spec-document/index.mjs");
const pages = await import("../src/review-pages/index.mjs").catch((error) => ({ error }));

// ---------------------------------------------------------------- the repository

const text = (...lines) => `${lines.join("\n")}\n`;
const pad2 = (n) => String(n).padStart(2, "0");
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const failure = (name, message, fields = {}) => Object.assign(new Error(message), { name }, fields);
const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/thesis-tool", web: "https://github.com/alice/thesis-tool" };
const TOKEN = { value: "github_pat_ALICEthesisTOOL0123456789abcdef", name: "Agent M · thesis-tool", expires: "2027-01-01" };
const recordOf = (id, kind, path, body) => [`docs/approvals/${id}-${blobOf(body).slice(0, 12)}.md`, text(`kind: ${kind}`, `file: ${path}`, `blob: ${blobOf(body)}`)];

const RULE = "A LOAN HAS A DUE DATE";
const SPEC = text("# Thesis tool — Specification", "", "## Lending", "", `**${RULE}** *(Product Owner)*`,
  "Every loan states the date by which the book is returned.", "*Check:* `tests/loan.test.mjs`");

// The use cases: UC-041 and UC-044 open, UC-043 changed since its earlier text was accepted, UC-042 and UC-045 accepted.
const useCase = (id, title, sentence) => text("---", `id: ${id}`, `title: ${title}`, "area: lending", "actors:", "  - Member", "realises:", `  - ${RULE}`,
  "---", `# ${id} ${title}`, "", `**Goal.** ${sentence}`);
const UC41 = useCase("UC-041", "Check out a book", "The member borrows a book at the desk.");
const UC42 = useCase("UC-042", "Extend a loan", "The member extends a loan once.");
const UC43_OLD = useCase("UC-043", "Return a book", "The member returns a book at the desk.");
const UC43 = useCase("UC-043", "Return a book", "The member returns a book and the card at the desk.");
const UC44 = useCase("UC-044", "Reserve a book", "The member reserves a book that is out.");
const UC45 = useCase("UC-045", "Renew a card", "The member renews the card for a year.");
const UC_PATH = { 41: "docs/use-cases/UC-041-check-out-a-book.md", 42: "docs/use-cases/UC-042-extend-a-loan.md", 43: "docs/use-cases/UC-043-return-a-book.md",
  44: "docs/use-cases/UC-044-reserve-a-book.md", 45: "docs/use-cases/UC-045-renew-a-card.md" };
const USE_CASE_STEPS = [
  { "README.md": "# Thesis tool\n", "SPEC.md": SPEC, [UC_PATH[41]]: UC41, [UC_PATH[42]]: UC42, [UC_PATH[43]]: UC43_OLD, [UC_PATH[44]]: UC44, [UC_PATH[45]]: UC45 },
  Object.fromEntries([recordOf("UC-042", "use-case", UC_PATH[42], UC42), recordOf("UC-043", "use-case", UC_PATH[43], UC43_OLD), recordOf("UC-045", "use-case", UC_PATH[45], UC45)]),
  { [UC_PATH[43]]: UC43 },
];

// The architecture: ARC-001 and MOD-shelf accepted, ARC-003 accepted at an earlier text and edited since, ARC-002, MOD-desk and MOD-queue open.
const DIAGRAM = ["", "```mermaid", "flowchart LR", "    Desk --> Shelf", "```", ""];
const decision = ({ id, title, refines = null, designs = [], sentence = "The desk and the shelf are two modules." }) =>
  text("---", `id: ${id}`, `title: ${title}`, ...(refines ? [`refines: ${refines}`] : []), "forced_by:", `  - ${RULE}`,
    ...(designs.length ? ["designs:", ...designs.map((name) => `  - ${name}`)] : []), "---", `# ${id} ${title}`, "", "## Context", "", "Books are lent at a desk.", "",
    "## Decision", "", sentence, ...DIAGRAM, "## Alternatives", "", "One module.", "", "## Consequences", "", "Two folders.");
const module_ = (id, title) => text("---", `id: ${id}`, `title: ${title}`, "folder: src/lending/", "realises:", `  - ${RULE}`,
  "follows:", "  - ARC-001", "uses:", "provides:", "  - lend", "---", `# ${id} ${title}`, "", "## Responsibility", "", "It lends a book.", "", "## Parts", "", "- `index.mjs`", "",
  "## Data", "", "Nothing.", "", "## Interfaces", "", "- `lend`", "", "## Files", "", "None.", "", "## Uses", "", "Nothing.");
const A = (n, slug) => `docs/architecture/ARC-00${n}-${slug}.md`;
const M = (slug) => `docs/architecture/MOD-${slug}.md`;
const ARC1 = decision({ id: "ARC-001", title: "Lending as a whole" });
const ARC2 = decision({ id: "ARC-002", title: "The desk", refines: "ARC-001", designs: ["MOD-desk"] });
const ARC3_OLD = decision({ id: "ARC-003", title: "The shelf", refines: "ARC-001", designs: ["MOD-shelf"], sentence: "Books stand on a shelf." });
const ARC3 = decision({ id: "ARC-003", title: "The shelf", refines: "ARC-001", designs: ["MOD-shelf"], sentence: "Books stand on a shelf by their number." });
const MOD_DESK = module_("MOD-desk", "The desk"), MOD_SHELF = module_("MOD-shelf", "The shelf"), MOD_QUEUE = module_("MOD-queue", "The queue");
const ARCHITECTURE_STEPS = [
  { "README.md": "# Thesis tool\n", "SPEC.md": SPEC, [A(1, "lending")]: ARC1, [A(2, "desk")]: ARC2, [A(3, "shelf")]: ARC3_OLD,
    [M("desk")]: MOD_DESK, [M("shelf")]: MOD_SHELF, [M("queue")]: MOD_QUEUE },
  Object.fromEntries([recordOf("ARC-001", "architecture-decision", A(1, "lending"), ARC1), recordOf("ARC-003", "architecture-decision", A(3, "shelf"), ARC3_OLD),
    recordOf("MOD-shelf", "module", M("shelf"), MOD_SHELF)]),
  { [A(3, "shelf")]: ARC3 },
];

// The SPEC change entries, one queue of four entries on four sections of the SPEC: 01 open; 02 approved — a record names its proposal and
// the section as the SPEC holds it, and no decision row names it —; 03 stale — a record names its proposal and another section —; 04 in SPEC — a decision row names it.
const QUEUE = "docs/spec-freigaben/2026-03-01_sample";
const SECTION_NAMES = { 1: "Reading", 2: "Writing", 3: "Sharing", 4: "Closing" };
const sectionOf = (n, sentence) => text(`## ${n}. ${SECTION_NAMES[n]}`, "", `**RULE ${n}** *(Fixture PO)*`, sentence, "*Check:* no automatic check; at review", "");
const ENTRY_SPEC = text("# Fixture product — Specification", "") + [1, 2, 3, 4].map((n) => sectionOf(n, `Rule ${n} as it holds now.`)).join("");
const anchorOf = (n) => `## ${n}. ${SECTION_NAMES[n]}`;
const proposalOf = (n) => sectionOf(n, `Rule ${n} as it is proposed.`);
const proposalPath = (n) => `${QUEUE}/${pad2(n)}-entry-${n}.md`;
const entryId = (n) => `spec-2026-03-01_sample-${pad2(n)}`;
const specRecord = (n, section) => [`docs/approvals/${entryId(n)}-${blobOf(proposalOf(n)).slice(0, 12)}.md`,
  text("kind: spec", `queue: ${QUEUE}`, `entry: ${pad2(n)}`, `proposal: ${proposalPath(n)}`, `blob: ${blobOf(proposalOf(n))}`, "target: SPEC.md", `anchor: ${anchorOf(n)}`, `section: ${blobOf(section)}`)];
const SPEC_ENTRY_STEPS = [{
  "README.md": "# Fixture product\n", "SPEC.md": ENTRY_SPEC,
  [`${QUEUE}/index.md`]: text("# SPEC approvals — queue 2026-03-01 · sample", "", "**Zieldatei aller Einträge:** `SPEC.md`", "",
    "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|",
    ...[1, 2, 3, 4].map((n) => `| ${pad2(n)} | \`SPEC.md\` | ${anchorOf(n)} | — | — |`)),
  [`${QUEUE}/entscheidungen.md`]: text("# Decisions — queue 2026-03-01 sample", "", "| Date | Entry | Decision | Reference |", "|---|---|---|---|",
    `| 2026-03-02 10:00 UTC | 4 | uebernommen | approval:${entryId(4)}-aaaaaaaaaaaa.md |`),
  ...Object.fromEntries([1, 2, 3, 4].flatMap((n) => [[proposalPath(n), proposalOf(n)],
    [`${QUEUE}/${pad2(n)}-entry-${n}.begruendung.md`, text(`# ${anchorOf(n)}: a change`, "", "**The change.** A sample change.", "", "**Impact list.**", `- RULE ${n}: named by nothing.`)]])),
  ...Object.fromEntries([specRecord(2, sectionText(ENTRY_SPEC, anchorOf(2))), specRecord(3, "another section\n")]),
}];

// ---------------------------------------------------------------- the fake host

function fakeHost(steps) {
  const commits = new Map();
  let made = 0, head = null;
  const commitOf = (tree, parent) => {
    const sha = createHash("sha1").update(`commit ${++made}`).digest("hex");
    commits.set(sha, { tree, parent, date: `2026-10-0${made}T10:00:00Z` });
    return sha;
  };
  for (const files of steps) head = commitOf(new Map([...(head ? commits.get(head).tree : []), ...Object.entries(files)]), head);
  const snapshotAt = (sha) => {
    const { tree } = commits.get(sha);
    return { repository: ON_GITHUB, ref: sha, commit: sha, paths: [...tree.keys()].sort(), read: async (path) => (tree.has(path) ? tree.get(path) : null),
      blob: (path) => (tree.has(path) ? blobOf(tree.get(path)) : null) };
  };
  return {
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
  };
}

// ---------------------------------------------------------------- the page

// The route `name` drawn for the files of `steps`, as a product's page; the SPEC change entries as the instance's own page.
async function show(name, steps, params = {}) {
  const route = pages.view?.routes.find((candidate) => candidate.name === name);
  assert.ok(route, `the route ${name}: ${pages.error?.message}`);
  const own = name === "spec-entry";
  const host = fakeHost(steps);
  const store = openStore("alice/agent-m");
  writeSetting(store, own ? "github-token" : "github-token:alice/thesis-tool", TOKEN);
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, { page: "review", instance: { repository: "alice/agent-m", host }, store, go() {},
    product: own ? null : { address: ON_GITHUB.web, kind: "github", host } }, params);
  return target;
}
function find(root, match) {
  const found = [];
  (function walk(node) { for (const kid of node.childNodes) { if (kid.nodeType === 1) { if (match(kid)) found.push(kid); walk(kid); } } })(root);
  return found;
}
const classesOf = (node) => node.className.split(" ").filter(Boolean);
const byClass = (root, name, className) => find(root, (node) => node.localName === name && classesOf(node).includes(className));
const rowOf = (target, id) => find(target, (node) => node.localName === "tr" && node.getAttribute("data-id") === id)[0];
const sectionOfFile = (target, id) => find(target, (node) => node.localName === "section" && node.getAttribute("data-id") === id)[0];
// The classes of the badge in `root` — [] where there is none —, never the node itself.
const badgeClasses = (root) => { const badge = byClass(root, "span", "badge")[0]; return badge ? classesOf(badge) : []; };
const reviewAllOf = (target, route) => find(target, (node) => node.localName === "a" && node.getAttribute("href") === `#${route}/id=all`);

// ---------------------------------------------------------------- the use cases

// TST-874001 · level: unit · module: MOD-review-pages
// guards: UC-008 (step 1); STATUS IS DERIVED FROM THE RECORDS
// given: the use cases UC-041 and UC-044 open, UC-043 changed since acceptance, UC-042 and UC-045 accepted
// input: the route use-case drawn as the list
// expect: the badge of each row carries exactly the classes badge and b-<status>: UC-041 b-open, UC-042 b-accepted, UC-043 b-changed, UC-044 b-open, UC-045 b-accepted; the texts stay open, accepted, changed since acceptance
test("TST-874001 use-case list — each status badge carries b-<status>, the class the page's style colours", async () => {
  const target = await show("use-case", USE_CASE_STEPS);
  assert.deepEqual(["UC-041", "UC-042", "UC-043", "UC-044", "UC-045"].map((id) => badgeClasses(rowOf(target, id))),
    [["badge", "b-open"], ["badge", "b-accepted"], ["badge", "b-changed"], ["badge", "b-open"], ["badge", "b-accepted"]]);
  assert.deepEqual(["UC-041", "UC-042", "UC-043"].map((id) => byClass(rowOf(target, id), "span", "badge")[0].textContent), ["open", "accepted", "changed since acceptance"]);
});

// TST-874002 · level: unit · module: MOD-review-pages
// guards: UC-008 (steps 2, 5a); STATUS IS DERIVED FROM THE RECORDS
// given: the same use cases
// input: the route use-case drawn for UC-041 (open), UC-043 (changed) and UC-042 (accepted), one page each
// expect: the page's badge carries exactly the classes badge and b-open, badge and b-changed, badge and b-accepted respectively
test("TST-874002 use-case file page — the status badge carries b-<status>", async () => {
  const classes = [];
  for (const id of ["UC-041", "UC-043", "UC-042"]) classes.push(badgeClasses(await show("use-case", USE_CASE_STEPS, { id })));
  assert.deepEqual(classes, [["badge", "b-open"], ["badge", "b-changed"], ["badge", "b-accepted"]]);
});

// TST-874003 · level: unit · module: MOD-review-pages
// guards: UC-008 (step 3e); SEVERAL FILES ARE ACCEPTED IN ONE CLICK
// given: the same use cases
// input: the route use-case drawn with the id all
// expect: three files on the page, UC-041 with badge and b-open, UC-043 with badge and b-changed, UC-044 with badge and b-open
test("TST-874003 use-case Review all page — each file's status badge carries b-<status>", async () => {
  const target = await show("use-case", USE_CASE_STEPS, { id: "all" });
  assert.deepEqual(["UC-041", "UC-043", "UC-044"].map((id) => badgeClasses(sectionOfFile(target, id))),
    [["badge", "b-open"], ["badge", "b-changed"], ["badge", "b-open"]]);
});

// TST-874004 · level: unit · module: MOD-review-pages
// guards: UC-008 (step 3e); SEVERAL FILES ARE ACCEPTED IN ONE CLICK; ONE CLICK PER DECISION
// given: the same use cases, three of the five not accepted
// input: the route use-case drawn as the list
// expect: one link to #use-case/id=all, of the classes btn and primary, whose text is exactly "Review all 3 not accepted"; the Review all page it leads to offers "Accept all 3 shown"
test("TST-874004 use-case list — Review all is a btn primary link naming the three files not accepted", async () => {
  const links = reviewAllOf(await show("use-case", USE_CASE_STEPS), "use-case");
  assert.equal(links.length, 1);
  assert.deepEqual(["btn", "primary"].map((name) => classesOf(links[0]).includes(name)), [true, true]);
  assert.equal(links[0].textContent, "Review all 3 not accepted");
  assert.equal(byClass(await show("use-case", USE_CASE_STEPS, { id: "all" }), "button", "accept-all")[0].textContent, "Accept all 3 shown");
});

// ---------------------------------------------------------------- the architecture

// TST-874005 · level: unit · module: MOD-review-pages
// guards: UC-023 (step 4); STATUS IS DERIVED FROM THE RECORDS
// given: the decisions ARC-001 accepted, ARC-002 open, ARC-003 changed since acceptance; the modules MOD-shelf accepted, MOD-desk and MOD-queue open
// input: the route decision drawn as the list; the route module drawn as the list
// expect: the decisions' rows carry badge and b-accepted, badge and b-open, badge and b-changed; the modules' rows MOD-desk badge and b-open, MOD-queue badge and b-open, MOD-shelf badge and b-accepted
test("TST-874005 architecture lists — each status badge carries b-<status>", async () => {
  const decisions = await show("decision", ARCHITECTURE_STEPS), modules = await show("module", ARCHITECTURE_STEPS);
  assert.deepEqual(["ARC-001", "ARC-002", "ARC-003"].map((id) => badgeClasses(rowOf(decisions, id))), [["badge", "b-accepted"], ["badge", "b-open"], ["badge", "b-changed"]]);
  assert.deepEqual(["MOD-desk", "MOD-queue", "MOD-shelf"].map((id) => badgeClasses(rowOf(modules, id))), [["badge", "b-open"], ["badge", "b-open"], ["badge", "b-accepted"]]);
});

// TST-874006 · level: unit · module: MOD-review-pages
// guards: UC-023 (steps 3, 4); STATUS IS DERIVED FROM THE RECORDS
// given: the same architecture
// input: the route decision drawn for ARC-002 (open), ARC-003 (changed) and ARC-001 (accepted); the route module drawn for MOD-desk (open) and MOD-shelf (accepted)
// expect: the badge of each page carries exactly badge and b-open, badge and b-changed, badge and b-accepted; badge and b-open, badge and b-accepted
test("TST-874006 architecture file pages — the status badge carries b-<status>", async () => {
  const decisions = [], modules = [];
  for (const id of ["ARC-002", "ARC-003", "ARC-001"]) decisions.push(badgeClasses(await show("decision", ARCHITECTURE_STEPS, { id })));
  for (const id of ["MOD-desk", "MOD-shelf"]) modules.push(badgeClasses(await show("module", ARCHITECTURE_STEPS, { id })));
  assert.deepEqual(decisions, [["badge", "b-open"], ["badge", "b-changed"], ["badge", "b-accepted"]]);
  assert.deepEqual(modules, [["badge", "b-open"], ["badge", "b-accepted"]]);
});

// TST-874007 · level: unit · module: MOD-review-pages
// guards: UC-023 (step 5); SEVERAL FILES ARE ACCEPTED IN ONE CLICK
// given: the same architecture
// input: the route decision drawn with the id all (the whole architecture)
// expect: four files — ARC-002 and MOD-desk and MOD-queue badge and b-open, ARC-003 badge and b-changed; none for ARC-001 and MOD-shelf
test("TST-874007 whole-architecture Review all page — each file's status badge carries b-<status>", async () => {
  const target = await show("decision", ARCHITECTURE_STEPS, { id: "all" });
  assert.deepEqual(["ARC-002", "ARC-003", "MOD-desk", "MOD-queue"].map((id) => badgeClasses(sectionOfFile(target, id))),
    [["badge", "b-open"], ["badge", "b-changed"], ["badge", "b-open"], ["badge", "b-open"]]);
  assert.deepEqual(["ARC-001", "MOD-shelf"].map((id) => sectionOfFile(target, id)), [undefined, undefined]);
});

// TST-874008 · level: unit · module: MOD-review-pages
// guards: UC-023 (step 5); SEVERAL FILES ARE ACCEPTED IN ONE CLICK; ONE CLICK PER DECISION
// given: the same architecture: of the decisions and modules four are not accepted, of the modules two
// input: the route decision drawn as the list; the route module drawn as the list
// expect: the decisions' list has one link to #decision/id=all of the classes btn and primary, with the text "Review all 4 not accepted" (the files its page shows); the modules' list one to #module/id=all, btn and primary, "Review all 2 not accepted"
test("TST-874008 architecture lists — Review all is a btn primary link naming the files not accepted", async () => {
  const decisions = reviewAllOf(await show("decision", ARCHITECTURE_STEPS), "decision"), modules = reviewAllOf(await show("module", ARCHITECTURE_STEPS), "module");
  assert.deepEqual([decisions.length, modules.length], [1, 1]);
  assert.deepEqual([decisions[0], modules[0]].map((link) => ["btn", "primary"].map((name) => classesOf(link).includes(name))), [[true, true], [true, true]]);
  assert.deepEqual([decisions[0], modules[0]].map((link) => link.textContent), ["Review all 4 not accepted", "Review all 2 not accepted"]);
  assert.equal(byClass(await show("decision", ARCHITECTURE_STEPS, { id: "all" }), "button", "accept-all")[0].textContent, "Accept all 4 shown");
});

// ---------------------------------------------------------------- the SPEC change entries

// TST-874009 · level: unit · module: MOD-review-pages
// guards: UC-006 (steps 1, 7); STATUS IS DERIVED FROM THE RECORDS
// given: a queue of four entries — 01 open, 02 approved (a record, no decision row), 03 stale (a record naming another section), 04 in SPEC (a decision row)
// input: the route spec-entry drawn as the list
// expect: the badges' classes are badge and b-open, badge and b-approved, badge and b-stale, badge and b-applied; their texts open, approved, stale, in SPEC
test("TST-874009 spec-entry list — each state's badge carries the class the page's style colours", async () => {
  const target = await show("spec-entry", SPEC_ENTRY_STEPS);
  assert.deepEqual([1, 2, 3, 4].map((n) => badgeClasses(rowOf(target, entryId(n)))),
    [["badge", "b-open"], ["badge", "b-approved"], ["badge", "b-stale"], ["badge", "b-applied"]]);
  assert.deepEqual([1, 2, 3, 4].map((n) => byClass(rowOf(target, entryId(n)), "span", "badge")[0].textContent), ["open", "approved", "stale", "in SPEC"]);
});

// TST-874010 · level: unit · module: MOD-review-pages
// guards: UC-006 (steps 1, 7, 4c); STATUS IS DERIVED FROM THE RECORDS
// given: the same queue
// input: the route spec-entry drawn for each of the four entries, one page each
// expect: the badge of each page carries exactly badge and b-open, badge and b-approved, badge and b-stale, badge and b-applied
test("TST-874010 spec-entry page — the state's badge carries the class the page's style colours", async () => {
  const classes = [];
  for (const n of [1, 2, 3, 4]) classes.push(badgeClasses(await show("spec-entry", SPEC_ENTRY_STEPS, { id: entryId(n) })));
  assert.deepEqual(classes, [["badge", "b-open"], ["badge", "b-approved"], ["badge", "b-stale"], ["badge", "b-applied"]]);
});

// ---------------------------------------------------------------- the style

// TST-874011 · level: unit · module: MOD-review-pages
// guards: UC-008
// given: the page's style, docs/assets/style.css, which docs/index.html loads
// input: the selectors of its rules
// expect: known positive for the classes the tests above expect: a rule for each of .b-open, .b-accepted, .b-changed, .b-approved, .b-stale, .b-applied and .btn.primary
test("TST-874011 the page's style colours every class the pages write", () => {
  const style = readFileSync(new URL("../docs/assets/style.css", import.meta.url), "utf8");
  const selectors = [...style.matchAll(/([^{}]+)\{/g)].flatMap((match) => match[1].split(",").map((each) => each.trim()));
  for (const wanted of [".b-open", ".b-accepted", ".b-changed", ".b-approved", ".b-stale", ".b-applied", ".btn.primary"]) {
    assert.ok(selectors.includes(wanted), `a rule for ${wanted}`);
  }
});
