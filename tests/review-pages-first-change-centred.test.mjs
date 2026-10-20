// MOD-review-pages opens each difference of a changed file in a box of its own that scrolls, with its first change in the middle of the box (ITM-877), as the
// accepted text of docs/architecture/MOD-review-pages.md states it for `<k>/<id>`: "its difference to the text the most recent approval record of its identifier names
// (`A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT`), in a box of its own that scrolls, opened with its first change in the middle of the box", and for
// `<k>/all`: "a changed one as its difference, in a box of its own that scrolls, opened with its first change in the middle of the box".
// Run: node --test tests/review-pages-first-change-centred.test.mjs
//
// Module: MOD-review-pages
// Guards: UC-008; UC-023; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
// Level: unit
//
// This imports the browser harness of tests/review-pages-harness.mjs unchanged and gives its elements the geometry a browser gives them, in this file: the box of a
// difference (<pre class="diff">) is 200 px high and its top edge stands 100 px from the top of the window; each line of it (<span>) is 20 px high and stands one
// line below the one before, less the box's scrollTop. The page reads that geometry with getBoundingClientRect() of the box and of the line and the box's
// clientHeight, and sets the box's scrollTop. The repository is a Host of the tests' own over one repository in memory with a history, keeping to MOD-repository-hosts'
// interface. The real MOD-approvals, MOD-documents and MOD-browser-store run as they are. Nothing reaches the network. Readings the test takes where the module file
// leaves one open:
//   - "In the middle of the box" is the line's middle at the middle of the box: scrollTop = (line's top within the box's content + 10) - 100, never below 0.
//   - Only a box that holds the lines before the first change can show it in the middle: the box holds every line of the file, each marked as it is, not only the
//     lines near a change.
//   - The box is the <pre class="diff"> in <section class="accepted-diff">, which docs/assets/style.css makes a box that scrolls (`.accepted-diff .diff`).
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import "./review-pages-harness.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const { openStore, writeSetting } = await import("../src/browser-store/index.mjs");
const pages = await import("../src/review-pages/index.mjs").catch((error) => ({ error }));

// ---------------------------------------------------------------- the geometry of a browser, for the harness's elements

const ROW = 20, FRAME = 200, FRAME_TOP = 100;
const proto = Object.getPrototypeOf(document.createElement("div"));
const isBox = (node) => node.localName === "pre" && node.className.split(" ").includes("diff");
const rect = (top, height) => ({ top, height, bottom: top + height, left: 0, right: 600, width: 600 });
Object.defineProperty(proto, "clientHeight", { configurable: true, get() { return isBox(this) ? FRAME : 0; } });
Object.defineProperty(proto, "scrollTop", { configurable: true, get() { return this.scrolled ?? 0; }, set(value) { this.scrolled = value; } });
proto.getBoundingClientRect = function getBoundingClientRect() {
  if (isBox(this)) return rect(FRAME_TOP, FRAME);
  const box = this.parentNode;
  if (this.localName === "span" && box && isBox(box)) {
    return rect(FRAME_TOP + ROW * box.childNodes.filter((node) => node.nodeType === 1).indexOf(this) - box.scrollTop, ROW);
  }
  return rect(0, 0);
};

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
const FILLER = Array.from({ length: 14 }, (_, n) => `Filler line ${n + 1}.`);
// ARC-003 is 39 lines; its line "Books stand on a shelf." (0-based line 30) is the first and only change.
const decision = (sentence) => text("---", "id: ARC-003", "title: The shelf", "refines: ARC-001", "forced_by:", `  - ${RULE}`, "designs:", "  - MOD-shelf", "---", "# ARC-003 The shelf", "",
  "## Context", "", ...FILLER, "", "## Decision", "", sentence, "", "## Alternatives", "", "One module.", "", "## Consequences", "", "Two folders.");
const ARC1 = text("---", "id: ARC-001", "title: Lending as a whole", "forced_by:", `  - ${RULE}`, "---", "# ARC-001 Lending as a whole", "", "## Context", "", "Books are lent.", "",
  "## Decision", "", "Lending is a desk and a shelf.", "", "## Alternatives", "", "None.", "", "## Consequences", "", "Folders.");
const ARC3_OLD = decision("Books stand on a shelf."), ARC3 = decision("Books stand on a shelf by their number.");
// MOD-shelf, 37 lines: `title` stands on line 2, `heading` on line 12, `last` on line 36 (0-based). The edit of the main steps changes the heading and the last line.
const shelf = (title, heading, last) => text("---", "id: MOD-shelf", `title: ${title}`, "folder: src/lending/", "realises:", `  - ${RULE}`, "follows:", "  - ARC-001", "uses:", "provides:", "  - lend", "---",
  `# MOD-shelf ${heading}`, "","## Responsibility", "", "It keeps books.", "", "## Parts", "", "- `index.mjs`", "", "## Data", "", "Nothing.", "", "## Interfaces", "", "- `lend`", "", "## Files", "",
  "None.", "", "## Uses", "", last);
const SHELF_OLD = shelf("The shelf", "The shelf", "Nothing."), SHELF = shelf("The shelf", "The shelves", "Nothing at all.");
const SHELF_TITLED = shelf("The shelves", "The shelves", "Nothing at all.");
const A = (n, slug) => `docs/architecture/ARC-00${n}-${slug}.md`;
const M = (slug) => `docs/architecture/MOD-${slug}.md`;
const STEPS = [
  { "README.md": "# Thesis tool\n", "SPEC.md": SPEC, [A(1, "lending")]: ARC1, [A(3, "shelf")]: ARC3_OLD, [M("shelf")]: SHELF_OLD },
  Object.fromEntries([recordOf("ARC-001", "architecture-decision", A(1, "lending"), ARC1), recordOf("ARC-003", "architecture-decision", A(3, "shelf"), ARC3_OLD),
    recordOf("MOD-shelf", "module", M("shelf"), SHELF_OLD)]),
  { [A(3, "shelf")]: ARC3, [M("shelf")]: SHELF },
];
// The same product, where MOD-shelf's title (line 2) changed too.
const TITLED_STEPS = [...STEPS.slice(0, 2), { [A(3, "shelf")]: ARC3, [M("shelf")]: SHELF_TITLED }];

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

async function show(name, params, steps = STEPS) {
  const route = pages.view?.routes.find((candidate) => candidate.name === name);
  assert.ok(route, `the route ${name}: ${pages.error?.message}`);
  const host = fakeHost(steps);
  const store = openStore("alice/agent-m");
  writeSetting(store, "github-token:alice/thesis-tool", TOKEN);
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, { page: "review", instance: { repository: "alice/agent-m", host }, store, go() {},
    product: { address: ON_GITHUB.web, kind: "github", host } }, params);
  return target;
}
function elements(root) {
  const found = [];
  (function walk(node) { for (const kid of node.childNodes) { if (kid.nodeType === 1) { found.push(kid); walk(kid); } } })(root);
  return found;
}
const classesOf = (node) => node.className.split(" ").filter(Boolean);
const byClass = (root, name, className) => elements(root).filter((node) => node.localName === name && classesOf(node).includes(className));
const sectionOfFile = (target, id) => elements(target).find((node) => node.localName === "section" && node.getAttribute("data-id") === id);
// The boxes of the differences in `scope`: each as its scroll position, the number of its lines and whether it stands in <section class="accepted-diff">.
const boxesIn = (scope) => byClass(scope, "pre", "diff").map((box) => ({ scrollTop: box.scrollTop, lines: box.childNodes.filter((node) => node.nodeType === 1).length,
  inDiffSection: box.parentNode.localName === "section" && classesOf(box.parentNode).includes("accepted-diff") }));

// ---------------------------------------------------------------- the boxes

// TST-877001 · level: unit · module: MOD-review-pages
// guards: UC-008; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
// given: ARC-003, 39 lines, whose only change is line 30 (0-based), in a box 200 px high of lines 20 px high
// input: the route decision drawn for ARC-003
// expect: one box, in the section of the difference, holding all 39 lines and the empty one after the last newline (40 rows); its scrollTop 510, the line's middle (30 * 20 + 10 = 610) at the middle of the box (100 px down): 610 - 100
test("TST-877001 decision/<id> — the difference opens with its first change in the middle of its box", async () => {
  assert.equal(ARC3.split("\n").indexOf("Books stand on a shelf by their number."), 30, "the fixture: the change stands on line 30");
  assert.deepEqual(boxesIn(await show("decision", { id: "ARC-003" })), [{ scrollTop: 510, lines: 40, inDiffSection: true }]);
});

// TST-877002 · level: unit · module: MOD-review-pages
// guards: UC-008; UC-023
// given: ARC-003 changed on line 30, MOD-shelf changed on line 12 (its heading) and on line 36
// input: the route decision drawn with the id all (the whole architecture)
// expect: each file has a box of its own: ARC-003's scrollTop 510; MOD-shelf's 150 (12 * 20 + 10 - 100)
test("TST-877002 decision/all — each difference has a box of its own, opened at its own first change", async () => {
  const target = await show("decision", { id: "all" });
  assert.deepEqual([boxesIn(sectionOfFile(target, "ARC-003")), boxesIn(sectionOfFile(target, "MOD-shelf"))].map((boxes) => boxes.map((box) => box.scrollTop)), [[510], [150]]);
});

// TST-877003 · level: unit · module: MOD-review-pages
// guards: UC-008
// given: MOD-shelf, 37 lines, changed on line 12 and on line 36 (0-based)
// input: the route module drawn with the id all, and the route module drawn for MOD-shelf
// expect: on both pages the box of MOD-shelf has the scrollTop 150, not the position of its later change (36 * 20 + 10 - 100 = 630): the first change decides
test("TST-877003 module/all and module/<id> — the first change decides, not a later one", async () => {
  assert.deepEqual([SHELF.split("\n").indexOf("# MOD-shelf The shelves"), SHELF.split("\n").indexOf("Nothing at all.")], [12, 36], "the fixture");
  const all = boxesIn(sectionOfFile(await show("module", { id: "all" }), "MOD-shelf"));
  const page = boxesIn(await show("module", { id: "MOD-shelf" }));
  assert.deepEqual([all.map((box) => box.scrollTop), page.map((box) => box.scrollTop)], [[150], [150]]);
});

// TST-877006 · level: unit · module: MOD-review-pages
// guards: UC-008
// given: MOD-shelf with its title changed too, so that its first change stands on line 2 (0-based), whose middle (2 * 20 + 10 = 50) is above the middle of the box
// input: the route module drawn with the id all, and the route module drawn for MOD-shelf
// expect: the scrollTop 0 on both: a box does not scroll to a negative position
test("TST-877006 module/all and module/<id> — a first change near the top leaves the box at its start", async () => {
  assert.equal(SHELF_TITLED.split("\n").indexOf("title: The shelves"), 2, "the fixture");
  const all = boxesIn(sectionOfFile(await show("module", { id: "all" }, TITLED_STEPS), "MOD-shelf"));
  const page = boxesIn(await show("module", { id: "MOD-shelf" }, TITLED_STEPS));
  assert.deepEqual([all.map((box) => box.scrollTop), page.map((box) => box.scrollTop)], [[0], [0]]);
});

// TST-877004 · level: unit · module: MOD-review-pages
// guards: UC-008
// given: the same architecture; ARC-003 changed
// input: the route decision drawn for ARC-003
// expect: the box holds the lines before the change that are more than three lines from it: "Filler line 1." (line 13) is in the box, marked as unchanged ("  Filler line 1."), and the changed line is in it as removed and as added
test("TST-877004 decision/<id> — the box holds the whole file, each line marked as it is", async () => {
  const [box] = byClass(await show("decision", { id: "ARC-003" }), "pre", "diff");
  assert.deepEqual(box.childNodes.filter((node) => node.nodeType === 1).map((row) => row.textContent).filter((line) => /Filler line 1\.|Books stand/.test(line)).sort(),
    ["  Filler line 1.", "+ Books stand on a shelf by their number.", "- Books stand on a shelf."].sort());
});

// TST-877005 · level: unit · module: MOD-review-pages
// guards: UC-008
// given: docs/assets/style.css, which docs/index.html loads
// input: the rule for `.accepted-diff .diff`
// expect: known positive for the box that scrolls: the rule sets a maximum height and overflow: auto
test("TST-877005 the page's style makes the difference's box a box that scrolls", () => {
  const style = readFileSync(new URL("../docs/assets/style.css", import.meta.url), "utf8");
  const rule = /\.accepted-diff \.diff\s*\{([^}]*)\}/.exec(style)?.[1] ?? "";
  assert.deepEqual([/max-height:\s*\d+px/.test(rule), /overflow:\s*auto/.test(rule)], [true, true]);
});
