// MOD-resource-list's recipe `resource-pins` (ITM-1029), as the accepted text of docs/architecture/MOD-resource-list.md states it: "`resourceStrategies` — `Partial<Strategies>`
// with ... the recipe `resource-pins`: for a job of a kind with `resources: product`, one part with each resource of the product's list that the job's route reaches (`reachableBy`)
// and its pin, which its start record names among its `inputs`"; and MOD-job-catalogue's "`implement`, `refactor`, `fix-bug`, `write-tests` and `run-tests` have `resources: product`,
// and each of them names among its recipes MOD-resource-list's `resource-pins`". For UC-040 (a job that needs a resource).
// Run: node --test tests/resource-list-pins-recipe.test.mjs
//
// Module: MOD-resource-list
// Guards: UC-040; A RESOURCE IS PINNED TO AN EXACT STATE; A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE
// Level: unit
//
// The job context is a fixture of the type JobContext: the product's snapshot holds a `docs/resources.md`. No request is made. Where the file leaves a reading open, the test states the one it takes:
//   - The job's route is `context.params.route`, in the form MOD-job-ledger's record gives it: `tab`, `ci hosted`, `ci runner:<label>` or `bridge <name>`. A route reaches the resources whose
//     Route column is `bridge <name>` for `bridge <name>`, and `runner:<label>` for `ci runner:<label>`; `tab` and `ci hosted` reach none (as routesFor says: the tab and the server's own runners reach none).
//   - The start record's `inputs` entry is `<name>@<pin>` (MOD-resource-list's namedBy reads it so): the part's text holds that entry for every resource with a pin, on a line of its own.
//   - A resource without a pin (compute) is named in the part without an `@`.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { kindOf } from "../src/job-catalogue/index.mjs";
import * as resourceList from "../src/resource-list/index.mjs";

const { resourceStrategies } = resourceList;
const HEADER = "| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|";
const ROWS = [
  "| llm-a | endpoint | http://ws:8000/v1 | model-a-rev1 | — | — | bridge lab-pc | the group's workstation | no | — |",
  "| weights | model | https://hub.example.org/acme/weights | 0123456789abcdef0123456789abcdef01234567 | MIT | Acme | bridge lab-pc | — | — | — |",
  "| cluster | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |",
];
const text = `# Resources of this product\n\n**REGISTER**\n\nThe resources.\n\n${HEADER}\n${ROWS.join("\n")}\n`;
const snapshot = { read: async (path) => (path === "docs/resources.md" ? text : null), paths: ["docs/resources.md"] };
const contextOf = (kind, params) => ({ kind, params, product: { address: "https://github.com/acme/product", snapshot, host: null },
  instance: { snapshot: { read: async () => null, paths: [] }, host: null, checkout: null }, connect: async () => null, participants: [], places: { sources: {}, mailbox: null },
  gates: [], person: "alice", now: new Date("2026-10-18T08:00:00Z"), agentM: { version: "unreleased", commit: "a".repeat(40) }, jobId: "JOB-20261018-0800-abcd" });
const pins = async (kindName, route) => {
  const context = contextOf(await kindOf(kindName), { route });
  return resourceStrategies.recipes["resource-pins"](context, context.params);
};

// TST-102901 · level: unit · module: MOD-resource-list
// guards: A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE; A RESOURCE IS PINNED TO AN EXACT STATE; UC-040
// given: a product whose list holds three resources — two on the Bridge lab-pc, one on the runner gpu —; a job of implement on the route `bridge lab-pc`
// input: the recipe resource-pins
// expect: one part holding llm-a@model-a-rev1 and weights@0123456789abcdef0123456789abcdef01234567, each on a line of its own, and nothing of cluster
test("resource-pins gives, as one part, the resources the job's route reaches, with their pins", async () => {
  const parts = await pins("implement", "bridge lab-pc");
  assert.equal(parts.length, 1);
  const lines = parts[0].text.split("\n");
  assert.ok(lines.some((line) => line.includes("llm-a@model-a-rev1")), "the endpoint and its pin");
  assert.ok(lines.some((line) => line.includes("weights@0123456789abcdef0123456789abcdef01234567")), "the model and its pin");
});

// TST-102902 · level: unit · module: MOD-resource-list
// guards: A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE
// given: the same list and job; the known positive of TST-102901 shows the two resources the route reaches
// input: the recipe on `bridge lab-pc`, and on `ci runner:gpu`
// expect: counter-proof — the resource cluster, which the route bridge lab-pc does not reach, is in no part of that job; on `ci runner:gpu` the part holds cluster and neither of the others
test("resource-pins leaves out a resource the job's route does not reach", async () => {
  assert.match((await pins("implement", "bridge lab-pc"))[0].text, /llm-a@/, "known positive");
  assert.doesNotMatch((await pins("implement", "bridge lab-pc"))[0].text, /cluster/);
  const onRunner = (await pins("implement", "ci runner:gpu"))[0].text;
  assert.match(onRunner, /cluster/);
  assert.doesNotMatch(onRunner, /llm-a|weights/);
});

// TST-102903 · level: unit · module: MOD-job-catalogue
// guards: ONE DEFINITION, THREE DRIVERS; A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE
// given: the kinds of the catalogue
// input: kindOf of each
// expect: exactly the kinds with `resources: product` — implement, refactor, fix-bug, write-tests, run-tests — name the recipe resource-pins, none of them optional
test("the kinds with resources: product name the recipe resource-pins, and no other kind does", async () => {
  const product = ["implement", "refactor", "fix-bug", "write-tests", "run-tests"];
  for (const name of product) {
    const kind = await kindOf(name);
    assert.equal(kind.resources, "product", `${name} (known positive)`);
    assert.deepEqual(kind.recipes.filter((recipe) => recipe.name === "resource-pins"), [{ name: "resource-pins", optional: false }], name);
  }
  const { kindNames } = await import("../src/job-catalogue/index.mjs");
  for (const name of (await kindNames()).filter((each) => !product.includes(each))) {
    assert.ok(!(await kindOf(name)).recipes.some((recipe) => recipe.name === "resource-pins"), name);
  }
});
