// strategies.mjs — the recipe `test-selection` of `resultStrategies` (MOD-result-records, Parts: strategies.mjs; Interfaces: resultStrategies), for the kinds `propose-tests`
// and `write-tests` (UC-026 step 3): the text of each requirement, use case and module the job's parameters select, every existing test that guards any of them with its
// declaration and code, and the product's external services, each marked paid or free. The recipes `commit-and-levels` and the check and writer of the module's file are other
// items'; whichever item comes second adds to the set.
//
// Module: MOD-result-records
//
// It reads and writes text only: no service is called, paid or free.

import { readRegister } from "../documents/index.mjs";
import { testDeclarations } from "../test-document/index.mjs";
import { traceGraph, tracesTo } from "../trace-graph/index.mjs";
import { paidServices, resourceSchema } from "../resource-list/index.mjs";

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

// resultStrategies: MOD-job-runner's Partial<Strategies> with the recipe.
export const resultStrategies = { recipes: { "test-selection": testSelection } };
