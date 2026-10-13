// MOD-resource-list's recipe `resource-check` (ITM-463), as the accepted text of docs/architecture/MOD-resource-list.md states it: "`resourceStrategies` — `Partial<Strategies>`
// with the recipe `resource-check`: the resource a job names and the harmless request to make on the runner, as one part"; with `checkPlan`, which says that a resource reached
// by a runner is checked by a check job on that runner's label, and MOD-job-catalogue's kind `check-resource` (recipe `resource-check`, prompt "Make exactly the one harmless
// request named below, on the runner you work on, and nothing else"). For UC-040 (step 7, 7b). The check job's kind, its route and its page are other items'.
// Run: node --test tests/resource-list-recipe.test.mjs
//
// Module: MOD-resource-list
// Guards: UC-040; A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER; A RESOURCE CREDENTIAL GOES ONLY TO ITS RESOURCE; A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE; COMMIT TESTS CALL NO PAID SERVICE
// Level: unit
//
// The job context is a fixture of the type JobContext: the product's snapshot holds a `docs/resources.md`, read through the module's own schema. No request is made and no service
// is called, paid or free: the recipe only writes what a participant on the runner is to do. Where the file leaves a reading open, the test states the one it takes, and the pull
// request names it:
//   - The job names its resource by `params.resource`, the entry's Name; it is looked for in the product's `docs/resources.md`, and, where the product's list has none, in the
//     instance's own list.
//   - The recipe serves compute reached by a runner's label, and nothing else: the file gives a runner's check job to compute alone, and checks an endpoint or agent by a harmless probe
//     through the Bridge its route names. Every other resource — read on its host, probed through a Bridge, or an endpoint or agent that names a runner — is refused with
//     NotRunnerCheck { resource, kind }; a name no list holds with ResourceNotFound { resource }; a job that names none with ResourceNotNamed.
//   - The harmless request is a compute resource's partitions, with the scheduler's own read-only command (for SLURM `sinfo`: "View information about Slurm nodes and
//     partitions", slurm.schedmd.com/sinfo.html).
//   - The part names the secret and never holds its value: `ci:<NAME>` is named, a key kept in a browser is said not to reach the runner, and anything else in the Secret column is not repeated.
// Each test states its input and its expected result before it runs (given / input / expect); where a test expects something to be refused, the same call is first shown to succeed. The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { prepareJob, registerStrategies } from "../src/job-runner/index.mjs";
import * as resourceList from "../src/resource-list/index.mjs";

const { resourceStrategies } = resourceList;
const recipe = (context) => resourceStrategies.recipes["resource-check"](context, context.params);
const HEADER = "| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|";
const listOf = (...rows) => `# Resources of this product\n\n**REGISTER**\n\nThe resources.\n\n${HEADER}\n${rows.join("\n")}\n`;
const ROWS = {
  cluster: "| cluster | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |",
  "gpu-box": "| gpu-box | compute | gpu01.example.org | — | — | — | bridge lab-pc | this machine | — | — |",
  llm: "| llm | endpoint | http://gpu01:8000/v1/ | example-model | — | — | runner:cpu | the group's server | no | ci:LOCAL_LLM_KEY |",
  "llm-bridge": "| llm-bridge | endpoint | http://ws:8000/v1 | example-model | — | — | bridge workstation | the group's server | no | — |",
  coder: "| coder | agent | https://agent.example.org | example-model | — | Acme | runner:cpu | Acme | yes | browser |",
  tools: "| tools | repository | https://github.com/acme/tools | 0123456789abcdef0123456789abcdef01234567 | MIT | Acme | read on its host | — | — | — |",
  "cluster-key": "| cluster-key | compute | key.example.org | — | — | — | runner:gpu | the lab | — | ci:CLUSTER_KEY |",
  "cluster-browser": "| cluster-browser | compute | browser.example.org | — | — | — | runner:gpu | the lab | — | browser |",
  leaky: "| leaky | compute | leaky.example.org | — | — | — | runner:gpu | the lab | — | sk-live-abc123def456 |",
};
const snapshotOf = (text) => ({ read: async (path) => (path === "docs/resources.md" ? text : null), paths: ["docs/resources.md"] });
const contextOf = (resource, { product = Object.values(ROWS), instance = [] } = {}) => ({ kind: null, params: resource === undefined ? {} : { resource },
  product: { address: "https://github.com/acme/product", snapshot: snapshotOf(listOf(...product)), host: null },
  instance: { snapshot: snapshotOf(listOf(...instance)), host: null, checkout: null }, connect: async () => null, participants: [], places: { sources: {}, mailbox: null },
  gates: [], person: "alice", now: new Date("2026-10-13T08:00:00Z"), agentM: { version: "unreleased", commit: "a".repeat(40) }, jobId: "JOB-20261013-0800-abcd" });
const textOf = async (context) => (await recipe(context))[0].text;
const failureOf = (p) => Promise.resolve(p).then(() => null, (error) => error);

// TST-472580 · level: unit · module: MOD-resource-list
// guards: A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER; UC-040 (7b)
// given: a product whose list holds a compute resource `cluster` on the runner gpu; a job that names it
// input: the recipe resource-check
// expect: one part named cluster, with no source, no artifact and required; its text names the resource, its kind and its address, the runner `gpu` and the processing place, and asks for the partitions with the scheduler's own read-only command — for SLURM sinfo —, as the one request, and nothing else
test("resource-check gives, as one part, a compute resource and the harmless request on its runner", async () => {
  const parts = await recipe(contextOf("cluster"));
  assert.equal(parts.length, 1);
  assert.deepEqual([parts[0].name, parts[0].sources, parts[0].artifacts, parts[0].required], ["cluster", [], [], true]);
  const text = parts[0].text;
  assert.match(text, /Resource: cluster, a compute at cluster\.example\.org\./);
  assert.match(text, /runner `gpu`/);
  assert.match(text, /NHR@FAU, Erlangen/);
  assert.match(text, /partitions/);
  assert.match(text, /read-only command/);
  assert.match(text, /sinfo/);
  assert.match(text, /exactly one request/);
});

// TST-472581 · level: unit · module: MOD-resource-list
// guards: A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER; UC-040 (7)
// given: an endpoint and an agent whose route names the runner cpu; compute on the runner gpu first
// input: the recipe for each
// expect: compute on its runner is given; the endpoint and the agent are refused with NotRunnerCheck naming the resource and its kind — they are checked by a harmless probe through the Bridge their route names, not by a runner's check job — and no part is given
test("resource-check refuses an endpoint or an agent that names a runner, by name", async () => {
  assert.equal((await recipe(contextOf("cluster"))).length, 1, "known positive");
  for (const [name, kind] of [["llm", "endpoint"], ["coder", "agent"]]) {
    const error = await failureOf(recipe(contextOf(name)));
    assert.equal(error?.name, "NotRunnerCheck", name);
    assert.deepEqual([error.resource, error.kind], [name, kind], name);
  }
});

// TST-472582 · level: unit · module: MOD-resource-list
// guards: A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER
// given: a list with a compute resource on the runner gpu; a compute resource on a Bridge, a repository, and an endpoint probed through a Bridge; a name no list holds; a job that names none; a resource only the instance's list holds
// input: the recipe for each
// expect: the runner's resource is given; the other three are refused with NotRunnerCheck naming the resource and how it is checked; the unknown name with ResourceNotFound; no name with ResourceNotNamed; the instance's resource found in the instance's list
test("resource-check refuses a resource that is not checked on a runner, by name", async () => {
  assert.equal((await recipe(contextOf("cluster"))).length, 1, "known positive");
  for (const [name, how] of [["gpu-box", "probe through the Bridge"], ["tools", "read on its host"], ["llm-bridge", "probe through the Bridge"]]) {
    const error = await failureOf(recipe(contextOf(name)));
    assert.equal(error?.name, "NotRunnerCheck", name);
    assert.deepEqual([error.resource, error.how], [name, how], name);
  }
  const unknown = await failureOf(recipe(contextOf("nowhere")));
  assert.deepEqual([unknown?.name, unknown?.resource], ["ResourceNotFound", "nowhere"]);
  assert.equal((await failureOf(recipe(contextOf(undefined))))?.name, "ResourceNotNamed");
  const only = contextOf("shared", { instance: ["| shared | compute | shared.example.org | — | — | — | runner:big | the lab | — | — |"] });
  assert.match(await textOf(only), /shared\.example\.org/);
});

// TST-472583 · level: unit · module: MOD-resource-list
// guards: A RESOURCE CREDENTIAL GOES ONLY TO ITS RESOURCE; A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE; NO SECRET IN THE REPOSITORY
// given: compute on a runner whose Secret is ci:CLUSTER_KEY; one whose key is kept in a browser; one whose Secret column holds a value, sk-live-abc123def456; one with none
// input: the recipe for each
// expect: the first names the secret CLUSTER_KEY and says the key is read from the runner's environment and sent only to this resource's address; the second says the key does not reach the runner; the third's part holds nothing of the value; the last says no credential is declared
test("resource-check names a secret and holds no secret's value", async () => {
  const named = await textOf(contextOf("cluster-key"));
  assert.match(named, /CI secret `CLUSTER_KEY`/);
  assert.match(named, /runner's environment/);
  assert.match(named, /only to this resource's address/);
  assert.match(await textOf(contextOf("cluster-browser")), /kept in a browser and does not reach the runner/);
  const leaky = await textOf(contextOf("leaky"));
  assert.equal(leaky.includes("sk-live-abc123def456"), false);
  assert.equal(leaky.includes("abc123"), false);
  assert.match(leaky, /no credential/i);
  assert.match(await textOf(contextOf("cluster")), /no credential/i);
});

// TST-472584 · level: unit · module: MOD-resource-list
// guards: ONE DEFINITION, THREE DRIVERS; UC-040 (7b)
// given: the recipe registered with the job runner under MOD-resource-list, the kind check-resource, and a drafter that runs code and tests
// input: prepareJob("check-resource", the context)
// expect: the job is prepared with one part, of the recipe resource-check, naming cluster; nothing blocks it
test("resource-check is a recipe the job runner finds for the kind check-resource", async () => {
  registerStrategies("MOD-resource-list", resourceStrategies);
  const drafter = { name: "runner-agent", type: "CI agent", model: "example-model", context: 200000, price: null, capabilities: ["run code and tests"], place: "the runner", route: "ci runner:gpu secret KEY" };
  const prepared = await prepareJob("check-resource", { ...contextOf("cluster"), participants: [drafter] }, { drafter, reviewers: [] });
  assert.deepEqual(prepared.parts.map((part) => [part.name, part.recipe]), [["cluster", "resource-check"]]);
  assert.deepEqual(prepared.blocking, []);
  assert.ok(prepared.parts[0].size > 0);
});
