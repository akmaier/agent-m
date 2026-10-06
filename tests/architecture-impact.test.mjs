// The impact list of an architecture change — docs/assets/traceability.mjs. Deterministic, no network.
// Run: node --test tests/*.test.mjs
//
// Module: MOD-traceability
// Guards: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; UC-023
// Level: unit
//
// SPEC §11 AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST (UC-023 steps 4–5, 4a–4c). Moved out of
// tests/architecture.test.mjs, unchanged, when it was split by module. ITM-018: impactList became architectureImpact over the
// link graph of the commit (linkGraph); the import and the call changed, no expected result. Between the jobs of sprint 04 the
// case of the component diagram was removed with the old componentDiagram: the dashboard draws it with MOD-trace-pages
// (src/trace-pages/diagram.mjs), whose cases are in tests/trace-pages-diagram.test.mjs.
//
// The product is the fixture under tests/fixtures/architecture/. Counter-proofs are listed in
// docs/measurements/2026-09-30_review-dashboard-mutations.md §8.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArchitecture } from "../docs/assets/artifacts.mjs";
import { moduleHeaders, architectureImpact, linkGraph } from "../docs/assets/traceability.mjs";
import { impactHtml } from "../docs/assets/dashboard/review-views.mjs";

const FIX = fileURLToPath(new URL("./fixtures/architecture/", import.meta.url));
const files = {};
(function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p); else files[relative(FIX, p).split("\\").join("/")] = readFileSync(p, "utf8");
  }
})(FIX);
const ARC = "docs/architecture/ARC-001-static-client.md", READER = "docs/architecture/MOD-reader.md";
const REVIEW = "docs/architecture/MOD-review.md", PAGE = "docs/architecture/MOD-page.md";
const UC1 = "docs/use-cases/UC-001-read-a-file.md", UC2 = "docs/use-cases/UC-002-show-the-status.md";
const archPaths = [ARC, READER, REVIEW, PAGE];

// ---------------------------------------------------------------- the impact list

const headersOf = () => moduleHeaders({ paths: Object.keys(files), read: async (p) => files[p] });
// The graph the dashboard builds for an impact list: the architecture files at the commit shown and the code's headers.
const graphOf = (repo, headers) => linkGraph({ files: Object.fromEntries(archPaths.map((p) => [p, repo[p]])), headers });
test("AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a decision: the modules that follow it, their code and tests, names before and after", async () => {
  const before = parseArchitecture(ARC, files[ARC]);
  const text = files[ARC].replace("  - UC-001\n", "  - UC-002\n");
  const after = parseArchitecture(ARC, text);
  const imp = architectureImpact({ before, after, graph: graphOf({ ...files, [ARC]: text }, await headersOf()) });
  assert.deepEqual(imp.affected.map((a) => a.id), ["MOD-reader", "MOD-review"], "MOD-page follows nothing and is not listed");
  assert.deepEqual(imp.affected[0].code, ["src/reader.js"]);
  assert.deepEqual(imp.affected[0].tests, ["tests/reader.test.js"]);
  assert.deepEqual(imp.affected[1].code, ["src/review.py"]);
  assert.deepEqual(imp.affected[1].tests, []);
  assert.match(imp.affected[0].reasons.join(" "), /follows ARC-001/);
  assert.deepEqual(imp.names, { kept: ["RULE ONE"], added: ["UC-002"], removed: ["UC-001"] });
});

test("AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a module: users of an altered or removed interface, breaks first", async () => {
  const before = parseArchitecture(READER, files[READER]);
  // listTree removed, readFile altered.
  const text = files[READER].replace("  - listTree\n", "")
    .replace("- `listTree() -> [path]` — every file path at the pinned commit.\n", "")
    .replace("`readFile(path) -> text | null`", "`readFile(path, commit) -> text | null`");
  const after = parseArchitecture(READER, text);
  const imp = architectureImpact({ before, after, graph: graphOf({ ...files, [READER]: text }, await headersOf()) });
  assert.deepEqual(imp.removedInterfaces, ["listTree"]);
  assert.deepEqual(imp.alteredInterfaces, ["readFile"]);
  assert.deepEqual(imp.affected.map((a) => [a.id, a.breaks]), [["MOD-review", true], ["MOD-reader", false]],
    "the user of a removed interface first, marked breaks; then the changed module itself");
  assert.match(imp.affected[0].reasons.join(" "), /listTree, which the change removes/);
  assert.match(imp.affected[0].reasons.join(" "), /readFile, which the change alters/);
  assert.deepEqual(imp.affected[1].code, ["src/reader.js"]);
  assert.deepEqual(imp.names, { kept: ["RULE ONE", "UC-001"], added: [], removed: [] });
  const html = impactHtml(imp);
  assert.match(html, /MOD-review/);
  assert.match(html, /breaks/);
  assert.match(html, /src\/review\.py/);
  assert.match(html, /tests\/reader\.test\.js/);
  assert.match(html, /<details class="explain">/);
});

test("AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — counter-proof: a change to the text alone touches no user; no code is said so", async () => {
  const before = parseArchitecture(READER, files[READER]);
  const text = files[READER].replace("Reads the product's files, all at one commit.", "Reads files, all at one commit.");
  const imp = architectureImpact({ before, after: parseArchitecture(READER, text),
    graph: graphOf({ ...files, [READER]: text }, await headersOf()) });
  assert.deepEqual(imp.affected.map((a) => a.id), ["MOD-reader"], "MOD-review uses readFile, which did not change");
  assert.deepEqual([imp.removedInterfaces, imp.alteredInterfaces], [[], []]);
  // UC-023 4c: without code naming the module, the list says so.
  const none = architectureImpact({ before, after: parseArchitecture(READER, text), graph: graphOf(files, []) });
  assert.deepEqual(none.affected[0].code, []);
  assert.match(impactHtml(none), /no code yet/);
});
