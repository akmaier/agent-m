// MOD-review-pages shows a changed decision or module file as its difference and, below it, the file rendered with its diagrams (ITM-876), as the
// accepted texts state it: UC-008 3e "a changed one as its difference to the last accepted text (2a)", UC-008 2a "Above the text, the dashboard shows the
// difference", UC-008 step 2 "the dashboard renders its text and Mermaid diagram", and UC-023 steps 3 and 5 for the architecture. The page of one file
// and Review all do the same. Run: node --test tests/review-pages-changed-file-rendered.test.mjs
//
// Module: MOD-review-pages
// Guards: UC-008; UC-023; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
// Level: unit
//
// This imports the browser harness of tests/review-pages-harness.mjs unchanged. The repository is a Host of the tests' own over one repository in memory
// with a history, keeping to MOD-repository-hosts' interface. The real MOD-approvals, MOD-documents and MOD-browser-store run as they are. Nothing reaches
// the network. Readings the test takes where the module file leaves one open:
//   - The difference is <section class="accepted-diff">, as now. The file rendered is <section class="rendered"> holding the file's text as MOD-markdown-render
//     draws it; where a page cannot draw a diagram, the renderer shows <div class="unrendered"> with the diagram's source (the harness is such a page).
//   - "Below" is the order of the page: the rendered section stands after the difference.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import "./review-pages-harness.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const { openStore, writeSetting } = await import("../src/browser-store/index.mjs");
const pages = await import("../src/review-pages/index.mjs").catch((error) => ({ error }));

// ---------------------------------------------------------------- the repository

const text = (...lines) => `${lines.join("\n")}\n`;
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const failure = (name, message, fields = {}) => Object.assign(new Error(message), { name }, fields);
const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/thesis-tool", web: "https://github.com/alice/thesis-tool" };
const TOKEN = { value: "github_pat_ALICEthesisTOOL0123456789abcdef", name: "Agent M · thesis-tool", expires: "2027-01-01" };
const recordOf = (id, kind, path, body) => [`docs/approvals/${id}-${blobOf(body).slice(0, 12)}.md`, text(`kind: ${kind}`, `file: ${path}`, `blob: ${blobOf(body)}`)];

const RULE = "A LOAN HAS A DUE DATE";
const SPEC = text("# Thesis tool — Specification", "", "## Lending", "", `**${RULE}** *(Product Owner)*`,
  "Every loan states the date by which the book is returned.", "*Check:* `tests/loan.test.mjs`");
const DIAGRAM = ["", "```mermaid", "flowchart LR", "    Desk --> Shelf", "```", ""];
const decision = ({ id, title, refines = null, designs = [], sentence }) =>
  text("---", `id: ${id}`, `title: ${title}`, ...(refines ? [`refines: ${refines}`] : []), "forced_by:", `  - ${RULE}`,
    ...(designs.length ? ["designs:", ...designs.map((name) => `  - ${name}`)] : []), "---", `# ${id} ${title}`, "", "## Context", "", "Books are lent at a desk.", "",
    "## Decision", "", sentence, ...DIAGRAM, "## Alternatives", "", "One module.", "", "## Consequences", "", "Two folders.");
const module_ = (id, title, sentence) => text("---", `id: ${id}`, `title: ${title}`, "folder: src/lending/", "realises:", `  - ${RULE}`,
  "follows:", "  - ARC-001", "uses:", "provides:", "  - lend", "---", `# ${id} ${title}`, "", "## Responsibility", "", sentence, ...DIAGRAM, "## Parts", "", "- `index.mjs`", "",
  "## Data", "", "Nothing.", "", "## Interfaces", "", "- `lend`", "", "## Files", "", "None.", "", "## Uses", "", "Nothing.");
const A = (n, slug) => `docs/architecture/ARC-00${n}-${slug}.md`;
const M = (slug) => `docs/architecture/MOD-${slug}.md`;
const ARC1 = decision({ id: "ARC-001", title: "Lending as a whole", sentence: "Lending is a desk and a shelf." });
const ARC3_OLD = decision({ id: "ARC-003", title: "The shelf", refines: "ARC-001", designs: ["MOD-shelf"], sentence: "Books stand on a shelf." });
const ARC3 = decision({ id: "ARC-003", title: "The shelf", refines: "ARC-001", designs: ["MOD-shelf"], sentence: "Books stand on a shelf by their number." });
const SHELF_OLD = module_("MOD-shelf", "The shelf", "It keeps books.");
const SHELF = module_("MOD-shelf", "The shelf", "It keeps books in order of their number.");
// ARC-001 accepted; ARC-003 and MOD-shelf accepted at an earlier text and edited since.
const STEPS = [
  { "README.md": "# Thesis tool\n", "SPEC.md": SPEC, [A(1, "lending")]: ARC1, [A(3, "shelf")]: ARC3_OLD, [M("shelf")]: SHELF_OLD },
  Object.fromEntries([recordOf("ARC-001", "architecture-decision", A(1, "lending"), ARC1), recordOf("ARC-003", "architecture-decision", A(3, "shelf"), ARC3_OLD),
    recordOf("MOD-shelf", "module", M("shelf"), SHELF_OLD)]),
  { [A(3, "shelf")]: ARC3, [M("shelf")]: SHELF },
];

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

async function show(name, params) {
  const route = pages.view?.routes.find((candidate) => candidate.name === name);
  assert.ok(route, `the route ${name}: ${pages.error?.message}`);
  const host = fakeHost(STEPS);
  const store = openStore("alice/agent-m");
  writeSetting(store, "github-token:alice/thesis-tool", TOKEN);
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, { page: "review", instance: { repository: "alice/agent-m", host }, store, go() {},
    product: { address: ON_GITHUB.web, kind: "github", host } }, params);
  return target;
}
// Every element below `root`, in the order of the page.
function elements(root) {
  const found = [];
  (function walk(node) { for (const kid of node.childNodes) { if (kid.nodeType === 1) { found.push(kid); walk(kid); } } })(root);
  return found;
}
const classesOf = (node) => node.className.split(" ").filter(Boolean);
const byClass = (root, name, className) => elements(root).filter((node) => node.localName === name && classesOf(node).includes(className));
const sectionOfFile = (target, id) => elements(target).find((node) => node.localName === "section" && node.getAttribute("data-id") === id);

// What a changed file shows in `scope` (the page, or the file's section on Review all): how many differences and rendered files, whether the rendered
// file stands after the difference in the page's order, the diagrams in each, and the rendered file's text — never a node.
function shownIn(scope) {
  const order = elements(scope);
  const diff = byClass(scope, "section", "accepted-diff"), rendered = byClass(scope, "section", "rendered");
  return {
    diffs: diff.length, rendereds: rendered.length,
    renderedAfterDiff: diff.length === 1 && rendered.length === 1 && order.indexOf(rendered[0]) > order.indexOf(diff[0]),
    diagramsInRendered: rendered.length === 1 ? byClass(rendered[0], "div", "unrendered").filter((node) => node.textContent.includes("flowchart LR")).length : -1,
    diagramsInDiff: diff.length === 1 ? byClass(diff[0], "div", "unrendered").length : -1,
    renderedText: rendered.length === 1 ? rendered[0].textContent : "",
  };
}
const SHAPE = (shown) => [shown.diffs, shown.rendereds, shown.renderedAfterDiff, shown.diagramsInRendered, shown.diagramsInDiff];

// ---------------------------------------------------------------- the pages

// TST-876001 · level: unit · module: MOD-review-pages
// guards: UC-008 (steps 2, 2a); A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
// given: ARC-003, accepted at "Books stand on a shelf." and edited since to "Books stand on a shelf by their number.", the text holding a Mermaid diagram
// input: the route decision drawn for ARC-003
// expect: one difference and one rendered file; the rendered file after the difference on the page; the diagram once in the rendered file and none in the difference; the rendered file holds the new sentence
test("TST-876001 decision/<id> — a changed decision shows its difference and, below it, the file rendered with its diagram", async () => {
  const shown = shownIn(await show("decision", { id: "ARC-003" }));
  assert.deepEqual(SHAPE(shown), [1, 1, true, 1, 0]);
  assert.ok(shown.renderedText.includes("Books stand on a shelf by their number."), "the new sentence in the rendered file");
});

// TST-876002 · level: unit · module: MOD-review-pages
// guards: UC-008 (step 3e); UC-023 (step 5); A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
// given: the same architecture; ARC-003 changed
// input: the route decision drawn with the id all
// expect: in the section of ARC-003 one difference and one rendered file, the rendered file after the difference, the diagram once in it and none in the difference, the new sentence in it
test("TST-876002 decision/all — a changed file on Review all shows its difference and, below it, the file rendered with its diagram", async () => {
  const shown = shownIn(sectionOfFile(await show("decision", { id: "all" }), "ARC-003"));
  assert.deepEqual(SHAPE(shown), [1, 1, true, 1, 0]);
  assert.ok(shown.renderedText.includes("Books stand on a shelf by their number."), "the new sentence in the rendered file");
});

// TST-876003 · level: unit · module: MOD-review-pages
// guards: UC-008 (steps 2, 2a, 3e); UC-023 (step 5)
// given: MOD-shelf, accepted at "It keeps books." and edited since to "It keeps books in order of their number.", the text holding a Mermaid diagram
// input: the route module drawn for MOD-shelf, and with the id all
// expect: on each page one difference and one rendered file, the rendered file after the difference, the diagram once in it and none in the difference, the new sentence in it
test("TST-876003 module/<id> and module/all — a changed module file shows its difference and, below it, the file rendered with its diagram", async () => {
  const page = shownIn(await show("module", { id: "MOD-shelf" }));
  const all = shownIn(sectionOfFile(await show("module", { id: "all" }), "MOD-shelf"));
  assert.deepEqual([SHAPE(page), SHAPE(all)], [[1, 1, true, 1, 0], [1, 1, true, 1, 0]]);
  assert.deepEqual([page, all].map((shown) => shown.renderedText.includes("It keeps books in order of their number.")), [true, true]);
});

// TST-876004 · level: unit · module: MOD-review-pages
// guards: UC-008 (step 2)
// given: the same architecture; ARC-001 accepted, ARC-003 changed
// input: the route decision drawn with the id all
// expect: no section for ARC-001 (an accepted file is not on Review all); in the section of ARC-003 one rendered file and one diagram: the page does not render a file twice
test("TST-876004 decision/all — a changed file is rendered once", async () => {
  const target = await show("decision", { id: "all" });
  assert.equal(sectionOfFile(target, "ARC-001"), undefined);
  const section = sectionOfFile(target, "ARC-003");
  assert.deepEqual([byClass(section, "section", "rendered").length, byClass(section, "div", "unrendered").length], [1, 1]);
});
