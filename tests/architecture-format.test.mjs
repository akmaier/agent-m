// The format of ARC and MOD files, the requirement names of a SPEC and the Module lines of code — the readers of
// docs/assets/artifacts.mjs. Deterministic, no network. Run: node --test tests/*.test.mjs
//
// Module: MOD-artifacts
// Guards: ONE REVIEW LAYOUT FOR EVERY PRODUCT; ONE ARCHITECTURE DECISION, ONE FILE; ONE MODULE, ONE FILE; ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; UC-022; UC-023
// Level: unit
//
// SPEC §11 ONE ARCHITECTURE DECISION, ONE FILE · ONE MODULE, ONE FILE; §10 ONE REVIEW LAYOUT FOR EVERY PRODUCT (UC-022,
// UC-023). Moved out of tests/architecture.test.mjs and tests/review-page.test.mjs, unchanged, when those were split by module.
//
// The product is the fixture under tests/fixtures/architecture/. Counter-proofs are listed in
// docs/measurements/2026-09-30_review-dashboard-mutations.md §8.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { recordsForId, approvalPath, recordText, reviewedRecord } from "../docs/assets/review-core.mjs";
import {
  reviewedId, kindOfPath, parseArchitecture, specRequirements, isCodePath, isTestPath, headerModules,
} from "../docs/assets/artifacts.mjs";
import { moduleHeaders } from "../docs/assets/traceability.mjs";

const FIX = fileURLToPath(new URL("./fixtures/architecture/", import.meta.url));
const files = {};
(function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p); else files[relative(FIX, p).split("\\").join("/")] = readFileSync(p, "utf8");
  }
})(FIX);
const base = files; // the name tests/review-page.test.mjs gives the same fixture
const ARC = "docs/architecture/ARC-001-static-client.md", READER = "docs/architecture/MOD-reader.md";
const REVIEW = "docs/architecture/MOD-review.md", PAGE = "docs/architecture/MOD-page.md";
const UC1 = "docs/use-cases/UC-001-read-a-file.md", UC2 = "docs/use-cases/UC-002-show-the-status.md";

// ---------------------------------------------------------------- identifiers, records, status

test("ONE REVIEW LAYOUT FOR EVERY PRODUCT — ARC and MOD files are reviewed files with identifiers from their names", () => {
  assert.equal(reviewedId(ARC), "ARC-001");
  assert.equal(reviewedId("docs/architecture/ARC-001-renamed-since.md"), "ARC-001");
  assert.equal(reviewedId(READER), "MOD-reader");
  assert.equal(reviewedId("docs/architecture/MOD-review-core.md"), "MOD-review-core", "the whole slug is the identifier");
  assert.equal(reviewedId("docs/architecture/MOD-123-x.md"), "MOD-123-x", "a module is not read as an ARC-like number");
  assert.equal(reviewedId("docs/architecture/README.md"), null);
  assert.equal(kindOfPath(ARC), "architecture-decision");
  assert.equal(kindOfPath(READER), "module");
  assert.equal(kindOfPath(UC1), "use-case");
  assert.equal(kindOfPath("docs/architecture/notes.md"), null);
  assert.equal(approvalPath("MOD-reader", "0123456789ab".padEnd(40, "0")), "docs/approvals/MOD-reader-0123456789ab.md");
  const r = reviewedRecord(READER, "b".repeat(40));
  assert.deepEqual(r, { kind: "module", file: READER, blob: "b".repeat(40) });
  assert.equal(recordText(r), `kind: module\nfile: ${READER}\nblob: ${"b".repeat(40)}\n`, "the three lines of a use case's record");
  assert.equal(reviewedRecord(ARC, "a".repeat(40)).kind, "architecture-decision");
  assert.throws(() => reviewedRecord("docs/architecture/notes.md", "a".repeat(40)), /reviewed file/);
  // Records of MOD-reader are found by identifier; MOD-reader-extra's are not MOD-reader's.
  const recs = [reviewedRecord(READER, "a".repeat(40)), reviewedRecord("docs/architecture/MOD-reader-extra.md", "b".repeat(40)),
    reviewedRecord(ARC, "c".repeat(40))];
  assert.deepEqual(recordsForId(recs, "MOD-reader"), [recs[0]]);
  assert.deepEqual(recordsForId(recs, "ARC-001"), [recs[2]]);
});

// ---------------------------------------------------------------- the format

test("parseArchitecture — a decision: id, title, forced_by, and its four sections", () => {
  const a = parseArchitecture(ARC, files[ARC]);
  assert.equal(a.kind, "architecture-decision");
  assert.equal(a.id, "ARC-001");
  assert.equal(a.title, "The dashboard is a static client of the Git server's API");
  assert.deepEqual(a.names, ["RULE ONE", "UC-001"]);
  assert.deepEqual(a.requirements, ["RULE ONE"]);
  assert.deepEqual(a.useCases, ["UC-001"]);
  assert.deepEqual(a.follows, []);
  assert.deepEqual(a.problems, []);
  assert.ok(a.problems.length === 0);
  assert.match(parseArchitecture(ARC, files[ARC].replace("  - RULE ONE\n  - UC-001\n", "")).problems.join(" "), /forced_by must name at least one/,
    "a decision names what forces it");
  const broken = parseArchitecture(ARC, files[ARC].replace("## Alternatives\n", ""));
  assert.match(broken.problems.join(" "), /Alternatives/);
});

test("parseArchitecture — a module: realises, follows, uses MOD-x.interface, provides, each interface described", () => {
  const m = parseArchitecture(REVIEW, files[REVIEW]);
  assert.equal(m.kind, "module");
  assert.equal(m.id, "MOD-review");
  assert.deepEqual(m.names, ["THE READER'S RULE", "UC-002"]);
  assert.deepEqual(m.follows, ["ARC-001"]);
  assert.deepEqual(m.uses, [{ module: "MOD-reader", iface: "readFile" }, { module: "MOD-reader", iface: "listTree" },
    { module: "MOD-store", iface: "load" }]);
  assert.deepEqual(m.provides, ["status"]);
  assert.equal(m.interfaces.status, "- `status(path) -> \"open\" | \"accepted\" | \"changed\"`\n  — derived, never stored.");
  assert.deepEqual(m.problems, []);
  const page = parseArchitecture(PAGE, files[PAGE]);
  assert.deepEqual([page.names, page.follows, page.provides, page.problems], [[], [], [], []], "empty lists are lists");
  // Counter-proof: a use of an interface not written MOD-x.name, and a provided interface nobody describes.
  assert.ok(parseArchitecture(REVIEW, files[REVIEW].replace("  - MOD-reader.readFile\n", "  - readFile\n")).problems.length);
  assert.ok(parseArchitecture(REVIEW, files[REVIEW].replace("  - status\n", "  - status\n  - history\n")).problems.length);
  assert.ok(parseArchitecture("docs/architecture/MOD-other.md", files[REVIEW]).problems.length, "id differs from the file name");
});

// ---------------------------------------------------------------- ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS

test("specRequirements — the names in SPEC.md; a withdrawn one is marked; prose in bold is no requirement", () => {
  const r = specRequirements(files["SPEC.md"]);
  assert.deepEqual([...r.keys()], ["RULE ONE", "THE READER'S RULE", "OLD RULE"]);
  assert.deepEqual([...r.values()].map((x) => x.withdrawn), [false, false, true],
    "a source that runs over two lines is read whole — OLD RULE's withdrawal stands on its second line");
  // The known positive: every requirement a use case of this repository realises is found in its SPEC.
  const real = specRequirements(readFileSync(new URL("../SPEC.md", import.meta.url), "utf8"));
  assert.ok(real.size > 250);
  assert.ok(real.get("ACCEPTANCE IS A COMMIT IN GITHUB").withdrawn);
  assert.equal(real.get("ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON").withdrawn, false);
  assert.equal(real.get("A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED").withdrawn, false, "WITHDRAWN in the name is not a withdrawal");
});

// ---------------------------------------------------------------- a withdrawn file (from tests/review-page.test.mjs)

test("parseArchitecture: a withdrawn decision or module carries its date, its replacement and its note", () => {
  const p = "docs/architecture/ARC-008-correction-loop-as-one-harness.md";
  const w = parseArchitecture(p, readFileSync(new URL(`../${p}`, import.meta.url), "utf8")).withdrawn;
  assert.equal(w.date, "2026-10-01");
  assert.equal(w.replacedBy, "ARC-007");
  assert.match(w.note, /^Merged into ARC-007 on 2026-10-01/);
  assert.equal(parseArchitecture(ARC, base[ARC]).withdrawn, null, "counter-proof: a file not withdrawn has none");
});

// ---------------------------------------------------------------- module headers, which the impact list reads

test("module headers — `Module: MOD-x` in the first lines of a code file; tests told apart; Markdown and vendored code are not code", async () => {
  assert.deepEqual(headerModules(files["src/reader.js"]), ["MOD-reader"]);
  assert.deepEqual(headerModules(files["src/review.py"]), ["MOD-review"]);
  assert.deepEqual(headerModules(files["src/late.js"]), [], "a header after the first lines is not a header");
  assert.deepEqual(headerModules("/* Module: MOD-a */\n<!-- Module: MOD-b -->\n"), ["MOD-a", "MOD-b"]);
  assert.deepEqual(headerModules("const x = 'Module: MOD-a';\n"), [], "only a line that is a header, not a string in code");
  assert.ok(isCodePath("src/reader.js") && isCodePath("src/review.py") && isCodePath("docs/assets/review-core.mjs"));
  assert.ok(!isCodePath("src/notes.md") && !isCodePath("vendor/lib.js") && !isCodePath("node_modules/x/i.js")
    && !isCodePath("docs/assets/vendor/marked.esm.js") && !isCodePath("logo.png"));
  assert.ok(isTestPath("tests/reader.test.js") && isTestPath("tests/test_x.py") && isTestPath("src/x.spec.ts") && isTestPath("pkg/x_test.go"));
  assert.ok(isTestPath("tests/helpers.js") && isTestPath("pkg/__tests__/x.js"), "a file in a tests folder is a test");
  assert.ok(!isTestPath("src/reader.js") && !isTestPath("src/contest.js"));
  const read = [];
  const found = await moduleHeaders({ paths: Object.keys(files), read: async (p) => { read.push(p); return files[p]; } });
  assert.deepEqual(found, [
    { path: "src/reader.js", modules: ["MOD-reader"], test: false },
    { path: "src/review.py", modules: ["MOD-review"], test: false },
    { path: "tests/reader.test.js", modules: ["MOD-reader"], test: true },
  ]);
  assert.ok(!read.some((p) => p.endsWith(".md") || p.startsWith("vendor/")), "only code files are read");
});
