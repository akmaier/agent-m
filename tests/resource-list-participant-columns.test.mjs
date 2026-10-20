// A resource list with a participant's columns is rejected under A RESOURCE IS USED, A PARTICIPANT DEVELOPS (ITM-1154) — SPEC.md: a resource entry carrying participant fields (capabilities, role) is
// rejected, and MOD-resource-list: "An entry holds no capabilities and no role: whatever works on the product is a participant (`A RESOURCE IS USED, A PARTICIPANT DEVELOPS`)". The list is read with
// `resourceSchema` through MOD-documents; a table whose header adds columns the schema does not name is a finding of `documentFindings` "named at its first table's header", with "the `rule` of the part of
// the schema closest to it" (MOD-documents, `documentFindings`); the only part of the resource schema closest to a table's header is the section that holds the table, whose `rule` the schema language allows.
// Run: node --test tests/resource-list-participant-columns.test.mjs
//
// Module: MOD-resource-list
// Guards: A RESOURCE IS USED, A PARTICIPANT DEVELOPS; A PRODUCT DECLARES ITS RESOURCES; THE RESOURCE KIND IS ONE OF A CLOSED SET
// Level: unit
//
// The reading the test takes, which the pull request names: the rule the schema gives the section also becomes the rule of any cell finding that names no rule of its own, so the columns Name, Address and
// Route, which name none, keep A PRODUCT DECLARES ITS RESOURCES by naming it themselves; no other finding of the list changes its rule. Each test states its input and its expected result before it runs
// (given / input / expect). The counter-proofs are run as mutations and recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { documentFindings, readRegister } from "../src/documents/index.mjs";
import { resourceSchema } from "../src/resource-list/index.mjs";

const COLUMNS = ["Name", "Kind", "Address", "Pin", "Licence", "Maintainer", "Route", "Processing place", "Paid", "Secret"];
const AGENT = { Name: "coder", Kind: "agent", Address: "https://agents.example.org/coder", Pin: "coder-v1", Maintainer: "unknown", Route: "bridge workstation", "Processing place": "NHR@FAU, Erlangen", Paid: "no" };
const listOf = (rows, extra = []) => {
  const columns = [...COLUMNS, ...extra];
  return ["# Resources of this product", "", `| ${columns.join(" | ")} |`, `|${columns.map(() => "---").join("|")}|`, ...rows.map((row) => `| ${columns.map((column) => row[column] ?? "—").join(" | ")} |`), ""].join("\n");
};
const errorsOf = (text) => {
  const schema = resourceSchema();
  return documentFindings(schema, readRegister(schema, "docs/resources.md", text).document).filter((found) => found.kind === "error");
};
const DEVELOPS = "A RESOURCE IS USED, A PARTICIPANT DEVELOPS", DECLARES = "A PRODUCT DECLARES ITS RESOURCES";

// TST-115401 · level: unit · module: MOD-resource-list
// guards: A RESOURCE IS USED, A PARTICIPANT DEVELOPS
// given: a docs/resources.md whose table has, besides its ten columns, the columns Capabilities and Role, and an agent entry that fills them
// input: the list read with the schema and judged by documentFindings
// expect: it is rejected, and the rule of every error is A RESOURCE IS USED, A PARTICIPANT DEVELOPS
test("a list whose table adds the columns Capabilities and Role is rejected under A RESOURCE IS USED, A PARTICIPANT DEVELOPS", () => {
  const errors = errorsOf(listOf([{ ...AGENT, Capabilities: "draft text", Role: "Builders" }], ["Capabilities", "Role"]));
  assert.ok(errors.length > 0, "the list is rejected");
  assert.deepEqual([...new Set(errors.map((found) => found.rule))], [DEVELOPS]);
});

// TST-115402 · level: unit · module: MOD-resource-list
// guards: A RESOURCE IS USED, A PARTICIPANT DEVELOPS
// given: the same agent entry in a list without the two columns
// input: the list read with the schema and judged by documentFindings
// expect: counter-proof — it is accepted: no error
test("the same list without the two columns is accepted", () => {
  assert.deepEqual(errorsOf(listOf([AGENT])), []);
});

// TST-115403 · level: unit · module: MOD-resource-list
// guards: A PRODUCT DECLARES ITS RESOURCES; THE RESOURCE KIND IS ONE OF A CLOSED SET
// given: lists of the ten columns with a Name, an Address or a Route left out, and one with an unknown Kind
// input: each judged by documentFindings
// expect: no other finding of the list changes its rule: the three left-out cells are refused under A PRODUCT DECLARES ITS RESOURCES, the unknown kind under THE RESOURCE KIND IS ONE OF A CLOSED SET, and none under
//   A RESOURCE IS USED, A PARTICIPANT DEVELOPS
test("the other findings of the list keep their rules", () => {
  const cases = [["Name", { ...AGENT, Name: "" }, DECLARES], ["Address", { ...AGENT, Address: "" }, DECLARES], ["Route", { ...AGENT, Route: "" }, DECLARES],
    ["Kind", { ...AGENT, Kind: "gadget" }, "THE RESOURCE KIND IS ONE OF A CLOSED SET"]];
  for (const [what, row, rule] of cases) {
    const errors = errorsOf(listOf([row]));
    assert.ok(errors.length > 0, `known positive: ${what} left out or wrong is refused`);
    assert.deepEqual([...new Set(errors.map((found) => found.rule))], [rule], what);
  }
});
