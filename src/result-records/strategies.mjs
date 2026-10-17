// strategies.mjs — the recipe `test-selection` of `resultStrategies` (MOD-result-records, Parts: strategies.mjs; Interfaces: resultStrategies), for the kinds `propose-tests`
// and `write-tests` (UC-026 step 3): the text of each requirement, use case and module the job's parameters select, every existing test that guards any of them with its
// declaration and code, and the product's external services, each marked paid or free. The recipes `commit-and-levels` and the check and writer of the module's file are other
// items'; whichever item comes second adds to the set.
//
// Module: MOD-result-records
//
// It reads and writes text only: no service is called, paid or free.

import { readDocument, readRegister } from "../documents/index.mjs";
import { testDeclarations, isTestFile } from "../test-document/index.mjs";
import { finding } from "../text-tools/index.mjs";
import { traceGraph, tracesTo } from "../trace-graph/index.mjs";
import { paidServices, resourceSchema } from "../resource-list/index.mjs";
import { resultSchema } from "./read.mjs";

const RESOURCES = "docs/resources.md";
const listOf = (value) => (Array.isArray(value) ? value : []);

// The text of a selected name: a requirement as the SPEC states it (its name line to the next blank line), a use case or module its whole file; null for a name the graph lacks.
async function textOf(snapshot, node) {
  const text = await snapshot.read(node.path);
  if (typeof text !== "string") return null;
  if (node.kind !== "requirement") return `${node.id}\n\n${text.trim()}`;
  const lines = text.split("\n").slice(node.line - 1);
  const end = lines.findIndex((line) => line.trim() === "");
  return lines.slice(0, end < 0 ? lines.length : end).join("\n");
}

// The tests that guard a name: those `tracesTo` finds, and, for a module, those that exercise it.
function guardingTests(graph, name) {
  const exercising = graph.nodes.get(name)?.kind === "MOD"
    ? graph.edges.filter((edge) => edge.via === "exercises" && edge.to === name).map((edge) => edge.from) : [];
  return [...tracesTo(graph, name).tests, ...exercising];
}

// A test's declaration lines and its code, up to the next declaration of its file.
async function testText(snapshot, node) {
  const text = await snapshot.read(node.path);
  if (typeof text !== "string") return null;
  const declarations = testDeclarations(node.path, text);
  const at = declarations.findIndex((declaration) => declaration.id === node.id);
  if (at < 0) return null;
  const lines = text.split("\n");
  const next = declarations[at + 1]?.line ?? lines.length + 1;
  return lines.slice(declarations[at].line - 1, next - 1).join("\n").trimEnd();
}

// The product's external services, one line each, marked paid or free.
async function servicesText(snapshot) {
  const text = await snapshot.read(RESOURCES);
  if (typeof text !== "string") return [];
  const resources = readRegister(resourceSchema(), RESOURCES, text).rows.map(({ cells: c }) => ({ name: c.Name, kind: c.Kind, address: c.Address,
    paid: c.Paid === "yes" ? true : c.Paid === "no" ? false : null }));
  return paidServices(resources).map((service) => `- ${service.name} (${service.kind}, ${service.address}): ${service.paid ? "paid" : "free"}`);
}

/**
 * The recipe test-selection(context, params) -> Part[] — one part, `test-selection`: the text of each requirement, use case and module the parameters `requirements`,
 * `useCases` and `modules` name; every existing test that guards any of them, with its declaration and code; and the product's external services, each marked paid or free.
 */
async function testSelection(context, params) {
  const { snapshot } = context.product;
  const graph = await traceGraph(snapshot);
  const names = [...listOf(params?.requirements), ...listOf(params?.useCases), ...listOf(params?.modules)];
  const selected = [];
  for (const name of names) {
    const node = graph.nodes.get(name);
    const text = node ? await textOf(snapshot, node) : null;
    if (text !== null) selected.push(text);
  }
  const tests = [];
  for (const id of [...new Set(names.flatMap((name) => guardingTests(graph, name)))].sort()) {
    const text = await testText(snapshot, graph.nodes.get(id));
    if (text !== null) tests.push(text);
  }
  const text = [
    "The selection:", ...selected,
    "The existing tests that guard it:", ...(tests.length ? tests : ["(none)"]),
    "The product's external services:", (await servicesText(snapshot)).join("\n") || "(none)",
  ].join("\n\n");
  return [{ name: "test-selection", text, sources: [], required: true, artifacts: [] }];
}

const normal = (text) => String(text ?? "").replace(/\s+/g, " ").trim().toLowerCase();
const blank = (value) => typeof value !== "string" || value.trim() === "";

// The declarations of every test file of the product's snapshot.
async function existingTests(snapshot) {
  const found = [];
  for (const path of snapshot.paths.filter(isTestFile)) {
    const text = await snapshot.read(path);
    if (typeof text === "string") found.push(...testDeclarations(path, text));
  }
  return found;
}

const NEW_TEST = "A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT";
const EXPECTED = "A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS";

// The tests the branch adds: the declarations of every file whose blob differs from the product's, whose identifier the product's file of that path does not declare.
async function addedTests(branch, snapshot) {
  const added = [];
  for (const path of branch.paths.filter(isTestFile)) {
    if (branch.blob(path) === snapshot.blob(path)) continue;
    const before = snapshot.blob(path) === null ? "" : (await snapshot.read(path)) ?? "";
    const known = new Set(testDeclarations(path, before).map((declaration) => declaration.id));
    added.push(...testDeclarations(path, await branch.read(path)).filter((declaration) => !known.has(declaration.id)));
  }
  return added;
}

// Whether the branch holds a counter-proof record of the test that records it failing with its fault planted.
async function recordsFailure(branch, id) {
  const path = `docs/tests/counter-proofs/${id}.md`;
  const text = await branch.read(path);
  if (typeof text !== "string") return false;
  const document = readDocument(resultSchema.counterProof, path, text);
  const section = (heading) => document.sections.find((one) => one.heading === heading)?.text;
  return document.fields.outcome === "failed" && !blank(section("## Fault")) && !blank(section("## Result"));
}

// The ways a written test differs from the reviewed case it implements: [rule, what].
function differences(declaration, one) {
  if (!one) return [[NEW_TEST, `${declaration.id} implements no reviewed case: no case has its identifier`]];
  const same = [];
  const guarded = (list) => [...new Set(list)].sort().join("\n");
  if (declaration.level !== one.level) same.push([NEW_TEST, `${declaration.id} has level ${declaration.level}, its case ${one.level}`]);
  if (guarded(declaration.guards ?? []) !== guarded(Array.isArray(one.guards) ? one.guards : [])) same.push([NEW_TEST, `${declaration.id} guards ${(declaration.guards ?? []).join(", ")}, its case ${(one.guards ?? []).join(", ")}`]);
  if (normal(declaration.expect) !== normal(one.expected)) same.push([EXPECTED, `${declaration.id} expects "${declaration.expect}", its case "${one.expected}"`]);
  return same;
}

/**
 * The check test-proposals for the kind `write-tests` (the draft with a `branch`): the branch is read through the product's host; an error for each new test of a level other than `user`
 * without a counter-proof record that records it failing, unless the draft reports it `failed`; and an error for each new test whose identifier, level, guards or expected result
 * differ from the reviewed case in `context.params.draft`. A branch the host does not hold is one finding.
 */
async function writtenTests(draft, context) {
  const { host, snapshot } = context.product;
  let branch;
  try {
    branch = await host.readSnapshot(draft.branch);
  } catch (error) {
    if (error.name !== "NotFound") throw error;
    return [finding({ artifact: "answer", line: 1, kind: "error", rule: NEW_TEST, what: `the branch ${draft.branch} is not on the host`, fix: "push the branch, then report it" })];
  }
  const reviewed = context.params?.draft;
  const cases = Array.isArray(reviewed) ? reviewed : Array.isArray(reviewed?.cases) ? reviewed.cases : null;
  const reported = new Map(listOf(draft.tests).map((one) => [one.identifier, one]));
  const findings = [];
  for (const declaration of await addedTests(branch, snapshot)) {
    const at = { artifact: declaration.path, line: declaration.line, kind: "error" };
    if (declaration.level !== "user" && reported.get(declaration.id)?.outcome !== "failed" && !(await recordsFailure(branch, declaration.id))) {
      findings.push(finding({ ...at, rule: NEW_TEST, what: `the new test ${declaration.id} has no counter-proof record of it failing with its fault planted`,
        fix: `add docs/tests/counter-proofs/${declaration.id}.md recording the fault and the failing result, or report the test failed` }));
    }
    if (cases) for (const [rule, what] of differences(declaration, cases.find((one) => one.identifier === declaration.id))) {
      findings.push(finding({ ...at, rule, what, fix: "write the test as its reviewed case says" }));
    }
  }
  return findings;
}

/**
 * The check test-proposals(draft, context) -> Finding[], for the kind `propose-tests` (the draft's `cases`): an error for a case without an expected result, a model-dependent
 * case (one with `phrasings`) judged on fewer than two runs, and a case that guards nothing; an error for a case not classed `duplicate` that shares a guarded name, its input
 * and its expected result with an existing test. A draft without `cases` has no finding. It calls no model.
 */
async function testProposals(draft, context) {
  if (typeof draft?.branch === "string") return writtenTests(draft, context);
  const cases = Array.isArray(draft?.cases) ? draft.cases : [];
  const existing = cases.length ? await existingTests(context.product.snapshot) : [];
  const findings = [];
  cases.forEach((one, index) => {
    const at = { artifact: one.identifier ?? `case ${index + 1}`, line: index + 1, kind: "error" };
    if (blank(one.expected)) findings.push(finding({ ...at, rule: "A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS",
      what: `case ${at.artifact} names no expected result`, fix: "state the result the case expects before it runs" }));
    if (Array.isArray(one.phrasings) && one.phrasings.length > 0 && !(one.runs >= 2)) findings.push(finding({ ...at, rule: "A MODEL-DEPENDENT TEST IS MEASURED AS A RATE",
      what: `model-dependent case ${at.artifact} is judged on ${one.runs === undefined ? "no number of runs" : `${one.runs} run`}`, fix: "fix a number of runs of at least 2 before the first run" }));
    const guards = Array.isArray(one.guards) ? one.guards : [];
    if (guards.length === 0) findings.push(finding({ ...at, rule: "EVERY ARTIFACT NAMES ITS ORIGIN",
      what: `case ${at.artifact} guards no requirement, use case or module`, fix: "name the identifiers the case guards, or drop the case" }));
    const same = one.class === "duplicate" ? null : existing.find((test) => (test.guards ?? []).some((name) => guards.includes(name))
      && normal(test.input) === normal(one.input) && normal(test.expect) === normal(one.expected));
    if (same) findings.push(finding({ ...at, rule: "TEST GENERATION SEES THE EXISTING TESTS",
      what: `case ${at.artifact} has the guarded identifier, input and expected result of the existing test ${same.id} but is classed ${one.class ?? "unclassed"}`,
      fix: `class it duplicate of ${same.id}` }));
  });
  return findings;
}

// resultStrategies: MOD-job-runner's Partial<Strategies> with the recipe and the check.
export const resultStrategies = { recipes: { "test-selection": testSelection }, checks: { "test-proposals": testProposals } };
