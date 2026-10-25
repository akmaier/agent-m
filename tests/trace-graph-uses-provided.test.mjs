// Every interface a module's file names under `uses` is provided by the module it names (ITM-1016) — MOD-trace-graph's `graphFindings`,
// which reports "a `uses` edge whose interface the used module's node does not provide" (DEVELOP AGAINST INTERFACES), run over the
// files of this repository itself and not over a made-up one. Until now the check was tested on constructed repositories only
// (tests/trace-graph-checks.test.mjs), so a `uses:` line naming an interface that no module provides passed every test.
// Run: node --test tests/trace-graph-uses-provided.test.mjs
//
// Module: MOD-trace-graph
// Guards: DEVELOP AGAINST INTERFACES
// Level: component
//
// The graph is built of this repository: the tracked files (`git ls-files`), each read with node's fs, handed to `traceGraph` as a
// TextSource. Each test states its expected value in its own text; none takes it from a document. Only the findings of the one rule are looked at: the other rules' findings over this
// repository are other checks' business.

import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { traceGraph, graphFindings } from "../src/trace-graph/index.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RULE = "DEVELOP AGAINST INTERFACES";
const tracked = execFileSync("git", ["-C", ROOT, "ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);

// The findings of the rule over this repository's tracked files, with `edits` ({ path: text }) in place of the files they name.
async function interfaceFindings(edits = {}) {
  const read = async (path) => {
    if (path in edits) return edits[path];
    try { return readFileSync(join(ROOT, path), "utf8"); } catch { return null; }
  };
  const graph = await traceGraph({ paths: tracked, read });
  return graphFindings(graph).filter((finding) => finding.rule === RULE).map((finding) => `${finding.artifact}:${finding.line}: ${finding.what}`);
}

// TST-1016001 · level: component · module: MOD-trace-graph
// guards: DEVELOP AGAINST INTERFACES
// given: the tracked files of this repository, among them every module file under docs/architecture/
// input: traceGraph over them, then graphFindings
// expect: no finding of DEVELOP AGAINST INTERFACES — every `uses` line of every module file names an interface that the module it names provides
test("TST-1016001 every interface a module uses is provided by the module it names", async () => {
  assert.ok(tracked.includes("docs/architecture/MOD-main-page.md"), "known positive: the tracked files hold the module file read below");
  assert.deepEqual(await interfaceFindings(), []);
});

// TST-1016002 · level: component · module: MOD-trace-graph
// guards: DEVELOP AGAINST INTERFACES
// given: the files of TST-1016001, with the line `  - MOD-site-frame.menuOfX` — an interface no module provides — added as the first `uses` of MOD-main-page's file
// input: traceGraph over them, then graphFindings
// expect: exactly one finding more than over the unchanged files, and it is `MOD-main-page:9: uses MOD-site-frame.menuOfX, which MOD-site-frame does not provide` — the file, the line of the planted use and the interface
test("TST-1016002 a planted use of an interface no module provides is found, naming the file, the line and the interface", async () => {
  const path = "docs/architecture/MOD-main-page.md";
  const text = readFileSync(join(ROOT, path), "utf8");
  assert.match(text, /^uses:\n/m, "known positive: the file has a uses list to plant the line in");
  const planted = text.replace(/^uses:\n/m, "uses:\n  - MOD-site-frame.menuOfX\n");
  assert.notEqual(planted, text);
  const before = await interfaceFindings();
  const after = await interfaceFindings({ [path]: planted });
  assert.deepEqual(after.filter((finding) => !before.includes(finding)), ["MOD-main-page:9: uses MOD-site-frame.menuOfX, which MOD-site-frame does not provide"]);
  assert.equal(after.length, before.length + 1);
});
