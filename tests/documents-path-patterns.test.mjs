// The supported path patterns a Documents schema already validates and compiles decide one finding when a document is
// read from another path (ITM-297) — MOD-documents' public loadSchema, readDocument and documentFindings.
// Run: node --test tests/documents-path-patterns.test.mjs
//
// Module: MOD-documents
// Guards: UC-002; A FINDING READS LIKE A COMPILER MESSAGE; A DATA FORMAT IS DEFINED ONCE
// Level: unit
//
// Each case uses the public interface. A fitting path is the known positive before its wrong folder or extension. The
// mismatch names the document path, line 1 and the schema rule; no path in a schema adds no constraint.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { formatFinding } from "../src/text-tools/index.mjs";
import { loadSchema, readDocument, documentFindings } from "../src/documents/index.mjs";

const RULE = "A DATA FORMAT IS DEFINED ONCE";
const schemaFile = (schema) => `# ${schema.schema}\n\n\`\`\`json\n${JSON.stringify(schema)}\n\`\`\`\n`;
const load = (schema) => loadSchema(schemaFile(schema), "MOD-example");
const findingsOf = (schema, path, text = "") => documentFindings(schema, readDocument(schema, path, text));
const shape = (findings) => findings.map(({ artifact, line, kind, rule }) => ({ artifact, line, kind, rule }));

const singlePath = load({ schema: "example", shape: "document", rule: RULE, path: "docs/examples/{slug}.md" });
const alternatives = load({ schema: "example", shape: "document", rule: RULE,
  path: ["docs/examples/{slug}.md", "docs/archive/{slug}.md"] });
const unconstrained = load({ schema: "example", shape: "document", rule: RULE });
const withField = load({ schema: "example", shape: "document", rule: RULE, path: "docs/examples/{slug}.md",
  frontMatter: { title: { type: "text", required: true } } });

const mismatch = (path) => ({ artifact: path, line: 1, kind: "error", rule: RULE });

// TST-297001
// given: one supported string pattern and a document at its matching path
// input: public readDocument then documentFindings
// expect: no finding
test("TST-297001 — a string path pattern accepts its matching path", () => {
  assert.deepEqual(findingsOf(singlePath, "docs/examples/alpha.md"), []);
});

// TST-297002
// given: that same known-valid string pattern and a document in a wrong folder
// input: public readDocument then documentFindings
// expect: one compiler-form finding at line 1, naming its path and the schema rule
test("TST-297002 — a string path pattern rejects a wrong folder", () => {
  const path = "docs/other/alpha.md";
  const found = findingsOf(singlePath, path);
  assert.deepEqual(shape(found), [mismatch(path)]);
  assert.match(formatFinding(found[0]), new RegExp(`^${path}:1: error: .+ \\[${RULE}\\] — .+$`));
});

// TST-297003
// given: that same known-valid string pattern and a document with a wrong extension
// input: public readDocument then documentFindings
// expect: one compiler-form finding at line 1, naming its path and the schema rule
test("TST-297003 — a string path pattern rejects a wrong extension", () => {
  const path = "docs/examples/alpha.txt";
  const found = findingsOf(singlePath, path);
  assert.deepEqual(shape(found), [mismatch(path)]);
  assert.match(formatFinding(found[0]), new RegExp(`^${path}:1: error: .+ \\[${RULE}\\] — .+$`));
});

// TST-297004
// given: two supported list alternatives and a path fitting each alternative in turn
// input: public readDocument then documentFindings
// expect: neither valid alternative yields a finding
test("TST-297004 — a list of path patterns accepts either matching alternative", () => {
  assert.deepEqual(findingsOf(alternatives, "docs/examples/alpha.md"), []);
  assert.deepEqual(findingsOf(alternatives, "docs/archive/alpha.md"), []);
});

// TST-297005
// given: the list alternatives and a path fitting neither
// input: public readDocument then documentFindings
// expect: one compiler-form finding at line 1, naming its path and the schema rule
test("TST-297005 — a list of path patterns rejects a path fitting neither alternative", () => {
  const path = "docs/other/alpha.md";
  const found = findingsOf(alternatives, path);
  assert.deepEqual(shape(found), [mismatch(path)]);
  assert.match(formatFinding(found[0]), new RegExp(`^${path}:1: error: .+ \\[${RULE}\\] — .+$`));
});

// TST-297006
// given: a schema that names no path pattern and a repository-relative path
// input: public readDocument then documentFindings
// expect: no path finding
test("TST-297006 — an absent path pattern adds no path constraint", () => {
  assert.deepEqual(findingsOf(unconstrained, "any/folder/alpha.txt"), []);
});

// TST-297007
// given: a matching path and a required front-matter value left out
// input: public readDocument then documentFindings
// expect: the existing value finding remains, at line 1 under its own schema rule
test("TST-297007 — a path check preserves existing value findings", () => {
  const found = findingsOf(withField, "docs/examples/alpha.md", "");
  assert.deepEqual(shape(found), [{ artifact: "docs/examples/alpha.md", line: 1, kind: "error", rule: RULE }]);
  assert.equal(found[0].what, "the key title is required, and left out");
});


// TST-297008
// level: unit
// module: MOD-documents
// guards: UC-002; A FINDING READS LIKE A COMPILER MESSAGE; A DATA FORMAT IS DEFINED ONCE
// given: the exact source and the three public mismatch cases
// input: GitHub Ubuntu CI removes the compiled-pattern finding, runs the same cases, restores exact bytes, then reruns them
// expect: every mismatch case fails under the fault and passes after byte-exact restoration
test("TST-297008 — CI counter-proof restores path findings for the same public cases", () => {
  if (process.env.GITHUB_ACTIONS !== "true" || process.env.AGENT_M_297_FAULT_CHILD) return;
  const temporary = mkdtempSync(join(tmpdir(), "agent-m-297-documents-fault-")), copied = join(temporary, "repo");
  try {
    cpSync(process.cwd(), copied, { recursive: true, filter: (path) => !path.includes("/.git") && !path.includes("/node_modules") });
    const source = join(copied, "src", "documents", "checks.mjs");
    const testPath = join(copied, "tests", "documents-path-patterns.test.mjs");
    const original = readFileSync(source);
    const check = [
      "  if (compiled.patterns.length && !compiled.patterns.some(({ re }) => re.test(document.path))) {",
      "    add(1, [], `the path ${document.path} does not match a path of the format ${schema.schema}`,",
      "      `move the document to a path the format ${schema.schema} names`);",
      "  }",
    ].join("\n") + "\n\n";
    assert.equal(original.toString().split(check).length - 1, 1, "the path-finding fault target is unique");
    const ids = ["TST-297002", "TST-297003", "TST-297005"];
    const argv = [process.execPath, "--test", "--test-name-pattern", "TST-29700[235]", testPath];
    const invoke = () => {
      const env = { ...process.env, AGENT_M_297_FAULT_CHILD: "1" };
      delete env.NODE_TEST_CONTEXT;
      return spawnSync(argv[0], argv.slice(1), { cwd: copied, encoding: "utf8", timeout: 40_000, env });
    };
    const originalHash = createHash("sha256").update(original).digest("hex");
    const testHash = createHash("sha256").update(readFileSync(testPath)).digest("hex");
    const faultStarted = new Date().toISOString();
    writeFileSync(source, original.toString().replace(check, ""));
    const faultHash = createHash("sha256").update(readFileSync(source)).digest("hex");
    const failed = invoke();
    const faultEnded = new Date().toISOString();
    const restoreStarted = new Date().toISOString();
    writeFileSync(source, original);
    const restoredHash = createHash("sha256").update(readFileSync(source)).digest("hex");
    const passed = invoke();
    const restoreEnded = new Date().toISOString();
    process.stdout.write(`TST-297008-counterproof ${JSON.stringify({ argv, cwd: copied, ids, originalHash, faultHash, restoredHash, testHash, faultStarted, faultEnded, faultStatus: failed.status, faultSignal: failed.signal, faultError: failed.error?.code ?? null, faultStdout: failed.stdout, faultStderr: failed.stderr, restoreStarted, restoreEnded, restoredStatus: passed.status, restoredSignal: passed.signal, restoredError: passed.error?.code ?? null, restoredStdout: passed.stdout, restoredStderr: passed.stderr })}\n`);
    assert.equal(restoredHash, originalHash, "byte-exact source restoration precedes the same-case pass");
    assert.equal(failed.status, 1, "faulted child has normal Node failure status");
    for (const id of ids) assert.match(failed.stdout, new RegExp(`not ok \\d+ - ${id} —`), `${id} fails at the missing path finding`);
    assert.equal(passed.status, 0, "restored same-case child passes");
    for (const id of ids) assert.match(passed.stdout, new RegExp(`ok \\d+ - ${id} —`), `${id} passes after restoration`);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
