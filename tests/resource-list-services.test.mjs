// MOD-resource-list's paidServices and reachableBy (ITM-462), as the accepted text of docs/architecture/MOD-resource-list.md states them: "`paidServices(resources:
// Resource[]) -> { name, kind: "endpoint" | "agent" | "data", address, paid: boolean }[]` — every service the product calls — each endpoint and agent, and data with a Paid
// mark —, each marked paid or free, for MOD-result-records' recipe `test-selection` (UC-026), so that no commit-level test reaches a paid one (`COMMIT TESTS CALL NO PAID
// SERVICE`)"; "`reachableBy(resources: Resource[]) -> { resource: string, route: string }[]` — for the resources a job needs, the routes that reach them, `bridge <name>` or
// `runner:<label>` —, which their callers hand to MOD-runtimes' `routesFor`, so that only those routes are offered (`A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE`)". For
// UC-040 (step 9) and UC-026. The callers are other items'.
// Run: node --test tests/resource-list-services.test.mjs
//
// Module: MOD-resource-list
// Guards: UC-040; UC-026; COMMIT TESTS CALL NO PAID SERVICE; A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE
// Level: unit
//
// The fixture list is of the type Resource, as the file states it. No request is made. Where the file leaves a reading open, the test states the one it takes, and the pull
// request names it:
//   - A service whose Paid mark is missing — an error of resourceFindings — is listed as paid: no commit-level test is allowed to reach a service not known to be free.
//   - Both functions keep the list's order and one entry for a resource; they change nothing they are given.
//   - A resource is reached by the route its own Route column names when that is `bridge <name>` or `runner:<label>`, written exactly so; a repository, data and a model, read on
//     their host, and an endpoint or agent called directly at its own address, are reached by no Bridge or runner and are not listed.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { routesFor } from "../src/runtimes/index.mjs";
import * as resourceList from "../src/resource-list/index.mjs";

const { paidServices, reachableBy } = resourceList;
const entry = (name, kind, change = {}) => ({ name, kind, address: `address-of-${name}`, pin: kind === "compute" ? null : "pinned", licence: null, maintainer: null,
  route: "read on its host", place: null, paid: null, secret: null, ...change });
const LIST = Object.freeze([
  entry("tools", "repository"),
  entry("local-llm", "endpoint", { route: "bridge workstation", paid: false }),
  entry("corpus", "data"),
  entry("search-api", "data", { route: "https://search.example.org", paid: true }),
  entry("open-api", "data", { route: "https://open.example.org", paid: false }),
  entry("weights", "model"),
  entry("cluster", "compute", { route: "runner:gpu" }),
  entry("coder", "agent", { route: "bridge lab-pc", paid: true }),
  entry("hosted-llm", "endpoint", { route: "https://api.example.org/v1", paid: true }),
  entry("gpu-box", "compute", { route: "bridge lab-pc" }),
  entry("worker", "agent", { route: "runner:cpu", paid: false }),
]);

// TST-472595 · level: unit · module: MOD-resource-list
// guards: COMMIT TESTS CALL NO PAID SERVICE; UC-040 (step 9); UC-026
// given: a list of a repository, three endpoints, agents, data with a Paid mark of yes and of no, data without a mark, a model and two compute resources
// input: paidServices of the list
// expect: exactly the endpoints, the agents and the data with a mark, in the list's order, each as { name, kind, address, paid } — local-llm free, search-api paid, open-api free, coder paid, hosted-llm paid, worker free —; the repository, the model, the compute and the unmarked data are not listed; the list is as it was
test("paidServices lists every endpoint, agent and marked data with its mark, and nothing else", () => {
  assert.deepEqual(paidServices(LIST), [
    { name: "local-llm", kind: "endpoint", address: "address-of-local-llm", paid: false },
    { name: "search-api", kind: "data", address: "address-of-search-api", paid: true },
    { name: "open-api", kind: "data", address: "address-of-open-api", paid: false },
    { name: "coder", kind: "agent", address: "address-of-coder", paid: true },
    { name: "hosted-llm", kind: "endpoint", address: "address-of-hosted-llm", paid: true },
    { name: "worker", kind: "agent", address: "address-of-worker", paid: false },
  ]);
  assert.deepEqual(paidServices([]), []);
  assert.equal(LIST.length, 11);
});

// TST-472596 · level: unit · module: MOD-resource-list
// guards: COMMIT TESTS CALL NO PAID SERVICE
// given: an endpoint and an agent whose Paid mark is missing, and one with a mark of no
// input: paidServices of each
// expect: the unmarked endpoint and agent are listed as paid; the marked one as free
test("paidServices lists a service without a Paid mark as paid", () => {
  assert.deepEqual(paidServices([entry("known-free", "endpoint", { paid: false })]).map((s) => s.paid), [false], "known positive");
  assert.deepEqual(paidServices([entry("unmarked", "endpoint"), entry("also-unmarked", "agent")]).map((s) => [s.name, s.paid]), [["unmarked", true], ["also-unmarked", true]]);
});

// TST-472597 · level: unit · module: MOD-resource-list
// guards: A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE; A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER; UC-040 (step 9)
// given: the list
// input: reachableBy of the list
// expect: in the list's order, the endpoint, compute and agent on a Bridge or a runner with their routes — local-llm bridge workstation, cluster runner:gpu, coder bridge lab-pc, gpu-box bridge lab-pc, worker runner:cpu —; the repository, the data, the model and the endpoint called at its own address are not listed
test("reachableBy gives a resource on a Bridge or a runner its route, and a resource read on its host none", () => {
  assert.deepEqual(reachableBy(LIST), [
    { resource: "local-llm", route: "bridge workstation" },
    { resource: "cluster", route: "runner:gpu" },
    { resource: "coder", route: "bridge lab-pc" },
    { resource: "gpu-box", route: "bridge lab-pc" },
    { resource: "worker", route: "runner:cpu" },
  ]);
  assert.deepEqual(reachableBy([]), []);
});

// TST-472598 · level: unit · module: MOD-resource-list
// guards: A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE; UC-040 (step 9)
// given: a compute resource on the Bridge lab-pc and one on the runner gpu, as reachableBy gives them; a participant on lab-pc and one on the runner gpu
// input: routesFor of each participant, given the two participants, with the routes as its needs
// expect: the participant on lab-pc is offered for the Bridge need and refused, naming the resource and its route, for the runner need; the participant on the runner the other way round — the routes are in the form routesFor reads
test("the routes reachableBy gives are the form routesFor reads", () => {
  const product = { visibility: "private", jobWorkflow: true };
  const needs = reachableBy([entry("gpu-box", "compute", { route: "bridge lab-pc" }), entry("cluster", "compute", { route: "runner:gpu" })]);
  assert.equal(needs.length, 2, "known positive");
  const onBridge = { name: "a", route: "bridge lab-pc agent claude" }, onRunner = { name: "b", route: "ci runner:gpu secret KEY" }, register = [onBridge, onRunner];
  const bridgeOnly = routesFor(onBridge, register, product, [needs[0]]), runnerOnly = routesFor(onRunner, register, product, [needs[1]]);
  assert.deepEqual([bridgeOnly[0].available, runnerOnly[0].available], [true, true]);
  const wrong = routesFor(onBridge, register, product, [needs[1]]);
  assert.equal(wrong[0].available, false);
  assert.match(wrong[0].reason, /runner:gpu/);
  assert.equal(routesFor(onRunner, register, product, [needs[0]])[0].available, false);
});
