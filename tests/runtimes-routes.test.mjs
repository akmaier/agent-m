// The routes a participant offers (ITM-318, ITM-494) — MOD-runtimes' routesFor(participant, product, needs), as the accepted text of
// docs/architecture/MOD-runtimes.md states it (Interfaces: Route, RouteOffer, ResourceNeed, routesFor), for UC-005 step 3, UC-010
// step 1, UC-011 1c and 1d, UC-017 step 3 and UC-049 1b and 4a: from a participant's route, its connection's — `endpoint <name>`, `endpoint <name>
// secret <NAME>`, `ci hosted secret <NAME>`, `ci runner:<label> secret <NAME>`, `bridge <bridge> agent <agent>`, none for an agent without a connection — the
// routes it offers: a model endpoint in the tab, and, where its route names the CI secret of its key, on the server's runners too; a
// CI agent on the server's runners, or on its self-hosted runner only for a product the server reports private, refused with the
// reason otherwise; a coding agent through the Bridge its route names; the CI route unavailable, naming the job workflow's
// files, while the product has none; a job that needs a resource offered only on the routes that reach it — for `bridge <name>` a
// participant whose route names that Bridge, for `runner:<label>` that runner. The pages that call it (ITM-361 to ITM-363, ITM-352)
// are not part of this item.
// Run: node --test tests/runtimes-routes.test.mjs
//
// Module: MOD-runtimes
// Guards: UC-005; UC-007; UC-010; UC-011; UC-017; UC-019; A RUNTIME IS INTERCHANGEABLE; AGENT M WORKS WITHOUT A LOCAL INSTALLATION
// Guards: A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY; A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// Level: unit
//
// routesFor is pure: it is given a participant — an agent on its connection as MOD-participant-list's participantsOf gives it, of which it
// reads the `route` —, the product's visibility and whether it holds the job workflow, and the needs, and answers with one offer for
// the participant's one route, or, for a model endpoint that names the CI secret of its key, with two. A refusal's words are the code's; a test asks of an offer that it is unavailable, that its reason is one
// line, and that the reason names what the refusal is about — the self-hosted runner and the repository's visibility; the job
// workflow's files; the resource and the route it needs. The module file gives `routesFor` no server: the job workflow's files are
// named for both servers. Each test states its input and its expected result before it runs (given / input / expect). A name the
// module does not provide yet is undefined here, so that each test fails by itself. Nothing reaches the network. The counter-proofs are
// recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as runtimes from "../src/runtimes/index.mjs";

const { routesFor } = runtimes;

// ---------------------------------------------------------------- the participants and the products

const participant = (name, type, route) => ({ name, type, model: type === "person" ? null : "example-model", context: 200000,
  price: null, capabilities: ["draft text"], place: "this machine", route });
const ENDPOINT = participant("drafter-a", "model endpoint", "endpoint fau-nhr");
const HOSTED = participant("ci-hosted", "CI agent", "ci hosted secret CLAUDE_KEY");
const GPU_RUNNER = participant("ci-gpu", "CI agent", "ci runner:gpu secret CLAUDE_KEY");
const CPU_RUNNER = participant("ci-cpu", "CI agent", "ci runner:cpu secret CLAUDE_KEY");
const WORKSTATION = participant("cli-workstation", "CLI agent", "bridge workstation agent claude");
const LAB = participant("cli-lab", "sandboxed agent", "bridge lab-pc agent codex");
// Named alike but of the other kind: a runner called workstation, a Bridge called gpu.
const RUNNER_WORKSTATION = participant("ci-workstation", "CI agent", "ci runner:workstation secret CLAUDE_KEY");
const BRIDGE_GPU = participant("cli-gpu", "CLI agent", "bridge gpu agent claude");
const PERSON = participant("alice", "person", "account github.com/alice");
const ALL = [ENDPOINT, HOSTED, GPU_RUNNER, CPU_RUNNER, WORKSTATION, LAB];

const PRIVATE = { visibility: "private", jobWorkflow: true };
const WORKFLOW_FILES = [".github/workflows/agent-m-jobs.yml", ".gitlab/agent-m-jobs.yml"];
const BRIDGE_NEED = { resource: "the workstation's GPU", route: "bridge workstation" };
const RUNNER_NEED = { resource: "the GPU machine", route: "runner:gpu" };

const TAB = { kind: "tab" }, HOSTED_CI = { kind: "ci", runner: "hosted" };
const route = {
  [ENDPOINT.name]: TAB, [HOSTED.name]: HOSTED_CI, [GPU_RUNNER.name]: { kind: "ci", runner: "gpu" },
  [CPU_RUNNER.name]: { kind: "ci", runner: "cpu" }, [WORKSTATION.name]: { kind: "bridge", bridge: "workstation" },
  [LAB.name]: { kind: "bridge", bridge: "lab-pc" },
};

// The offer of each participant of the list, by its name.
const offers = (product, needs, among = ALL) => Object.fromEntries(among.map((each) => {
  const found = routesFor(each, product, needs);
  assert.equal(found.length, 1, `${each.name}: one route, one offer`);
  return [each.name, found[0]];
}));
const available = (found) => Object.entries(found).filter(([, offer]) => offer.available).map(([name]) => name);
// A refusal: unavailable, with a reason of one line that names each of these.
function assertRefused(offer, names, label) {
  assert.equal(offer.available, false, `${label}: unavailable`);
  assert.equal(typeof offer.reason, "string", label);
  assert.match(offer.reason, /^[^\n]+$/, `${label}: one line`);
  for (const name of names) assert.ok(offer.reason.includes(name), `${label}: the reason names ${name}: ${offer.reason}`);
}

// ---------------------------------------------------------------- the route forms

// TST-472706 · level: unit · module: MOD-runtimes
// guards: A RUNTIME IS INTERCHANGEABLE; AGENT M WORKS WITHOUT A LOCAL INSTALLATION; UC-017; UC-010; UC-011
// given: a private product that holds the job workflow, no need, and a participant of each route form — `endpoint fau-nhr`, `ci hosted secret …`, `ci runner:gpu secret …`, `ci runner:cpu secret …`, `bridge workstation agent claude`, `bridge lab-pc agent codex` — and a person, whose route is an account
// input: routesFor(participant, the product, [])
// expect: for each of the six one offer, available with no reason, of the route it names — the tab; CI on the server's runners; CI on the runner gpu, and on cpu; the Bridge workstation, and lab-pc —; no offer for the person
test("routesFor — each route form is offered on the route it names, and a person on none", () => {
  const found = offers(PRIVATE, []);

  for (const each of ALL) assert.deepEqual(found[each.name], { route: route[each.name], available: true, reason: null }, each.name);
  assert.deepEqual(routesFor(PERSON, PRIVATE, []), []);
});

// ---------------------------------------------------------------- the self-hosted runner

// TST-472707 · level: unit · module: MOD-runtimes
// guards: A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY; UC-017
// given: the six participants, with a private product (the known positive), a public one and an internal one, each with the job workflow
// input: routesFor for each, no need
// expect: for the private product all six are available; for the public and the internal product the two on a self-hosted runner are refused, with a reason that names the runner and says the repository is not private, and the four others stay as they were
test("routesFor — a self-hosted runner is offered for a private repository only, and refused with the reason otherwise", () => {
  assert.deepEqual(available(offers(PRIVATE, [])), ALL.map((each) => each.name), "known positive: the private product");

  for (const visibility of ["public", "internal"]) {
    const found = offers({ visibility, jobWorkflow: true }, []);

    for (const each of [GPU_RUNNER, CPU_RUNNER]) assertRefused(found[each.name], ["runner", visibility, "private"], `${each.name} on a ${visibility} product`);
    assert.deepEqual(available(found), [ENDPOINT, HOSTED, WORKSTATION, LAB].map((each) => each.name), visibility);
  }
});

// ---------------------------------------------------------------- the job workflow

// TST-472708 · level: unit · module: MOD-runtimes
// guards: A RUNTIME IS INTERCHANGEABLE; AGENT M WORKS WITHOUT A LOCAL INSTALLATION; UC-010
// given: the six participants and a private product without the job workflow
// input: routesFor, no need
// expect: the three on the CI route are unavailable, with a reason that names the job workflow's files — those of GitHub and of GitLab —; the endpoint in the tab and the two on a Bridge are available
test("routesFor — the CI route is unavailable, naming the job workflow's files, while the product has none", () => {
  const found = offers({ visibility: "private", jobWorkflow: false }, []);

  for (const each of [HOSTED, GPU_RUNNER, CPU_RUNNER]) assertRefused(found[each.name], WORKFLOW_FILES, each.name);
  assert.deepEqual(available(found), [ENDPOINT, WORKSTATION, LAB].map((each) => each.name));
});

// ---------------------------------------------------------------- the needs

// TST-472709 · level: unit · module: MOD-runtimes
// guards: A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE; UC-011
// given: the six participants, a private product with the job workflow, and a job that needs a resource reached by `bridge workstation`
// input: routesFor, needs [that]; and with a public product, for the participants who are offered
// expect: only the participant whose route names the Bridge workstation is available; the others are refused with a reason that names the resource and `bridge workstation` — the participant on the Bridge lab-pc as well as the endpoint and the CI agents, and one on a runner that is called workstation —; it stays available on the public product
test("routesFor — a need reached by a Bridge is offered only to a participant on that Bridge", () => {
  const found = offers(PRIVATE, [BRIDGE_NEED]);

  assert.deepEqual(available(found), [WORKSTATION.name]);
  for (const each of ALL.filter((one) => one !== WORKSTATION)) assertRefused(found[each.name], [BRIDGE_NEED.resource, "bridge workstation"], each.name);
  assert.deepEqual(found[WORKSTATION.name], { route: route[WORKSTATION.name], available: true, reason: null });
  assert.deepEqual(available(offers({ visibility: "public", jobWorkflow: true }, [BRIDGE_NEED])), [WORKSTATION.name]);
  assertRefused(offers(PRIVATE, [BRIDGE_NEED], [RUNNER_WORKSTATION])[RUNNER_WORKSTATION.name], ["bridge workstation"], "a runner called workstation");
});

// TST-472710 · level: unit · module: MOD-runtimes
// guards: A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE; A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY; UC-005
// given: the six participants, a private product with the job workflow, and a job that needs a resource reached by `runner:gpu`
// input: routesFor, needs [that]; with a public product; without the job workflow; and with both needs at once
// expect: only the participant on the runner labelled gpu is available — not the server's runners, not the runner cpu, not the endpoint, not a Bridge, also one called gpu —, the others refused with a reason that names the resource and `runner:gpu`; on a public product that one is refused too, for the repository; without the job workflow, for the files; and with a need of the Bridge workstation and one of the runner gpu, no route serves both
test("routesFor — a need reached by a runner is offered on that runner only, and no route serves both a Bridge and a runner", () => {
  const found = offers(PRIVATE, [RUNNER_NEED]);

  assert.deepEqual(available(found), [GPU_RUNNER.name]);
  for (const each of ALL.filter((one) => one !== GPU_RUNNER)) assertRefused(found[each.name], [RUNNER_NEED.resource, "runner:gpu"], each.name);

  assertRefused(offers(PRIVATE, [RUNNER_NEED], [BRIDGE_GPU])[BRIDGE_GPU.name], ["runner:gpu"], "a Bridge called gpu");
  assertRefused(offers({ visibility: "public", jobWorkflow: true }, [RUNNER_NEED])[GPU_RUNNER.name], ["private"], "gpu on a public product");
  assertRefused(offers({ visibility: "private", jobWorkflow: false }, [RUNNER_NEED])[GPU_RUNNER.name], WORKFLOW_FILES, "gpu without the workflow");
  assert.deepEqual(available(offers(PRIVATE, [BRIDGE_NEED, RUNNER_NEED])), []);
});

// ---------------------------------------------------------------- an agent without a connection

// TST-20261109131 · level: unit · module: MOD-runtimes
// guards: A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL; UC-017
// given: an agent of the register whose model no connection given offers — the type agent, no route —, and, as the known positive, cli-workstation on its Bridge; a private product that holds the job workflow
// input: routesFor(each, the product, [])
// expect: the agent without a connection has no offer — an empty list —; cli-workstation has the offer of the Bridge workstation, available
test("routesFor — an agent that no connection offers has no route", () => {
  const unreached = { name: "dev-x", type: "agent", model: "absent-model", context: null, capabilities: [], place: null, route: null };
  assert.deepEqual(routesFor(WORKSTATION, PRIVATE, []), [{ route: { kind: "bridge", bridge: "workstation" }, available: true, reason: null }],
    "known positive");
  assert.deepEqual(routesFor(unreached, PRIVATE, []), []);
});

// ---------------------------------------------------------------- an endpoint whose key is a CI secret

const ENDPOINT_WITH_SECRET = participant("drafter-s", "model endpoint", "endpoint fau-nhr secret NHR_KEY");
const TAB_OFFER = { route: { kind: "tab" }, available: true, reason: null };
const HOSTED_OFFER = { route: { kind: "ci", runner: "hosted" }, available: true, reason: null };

// TST-494005 · level: unit · module: MOD-runtimes
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; AGENT M WORKS WITHOUT A LOCAL INSTALLATION; UC-049
// given: drafter-s, a model endpoint whose route is `endpoint fau-nhr secret NHR_KEY`; a private product that holds the job workflow
// input: routesFor(drafter-s, the product, []); and, as the known negative, routesFor(drafter-a, …), whose route `endpoint fau-nhr` names no secret
// expect: for drafter-s two offers, in this order: the tab `{ route: { kind: "tab" }, available: true, reason: null }`, then `{ route: { kind: "ci", runner: "hosted" }, available: true, reason: null }`; for drafter-a the one offer of the tab
test("routesFor — an endpoint whose route names the CI secret of its key is offered in the tab and on the server's runners", () => {

  assert.deepEqual(routesFor(ENDPOINT_WITH_SECRET, PRIVATE, []), [TAB_OFFER, HOSTED_OFFER]);
  assert.deepEqual(routesFor(ENDPOINT, PRIVATE, []), [TAB_OFFER], "known negative: no secret, no server's runners");
});

// TST-494006 · level: unit · module: MOD-runtimes
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; AGENT M WORKS WITHOUT A LOCAL INSTALLATION; UC-010
// given: drafter-s of TST-494005; ci-hosted (a CI agent on the server's runners), whose hosted offer the endpoint's follows
// input: routesFor with a private product without the job workflow; with a public product that holds it; with a job that needs `bridge workstation`; with a job that needs `runner:gpu`
// expect: without the job workflow the tab is available and the hosted offer is unavailable with the reason ci-hosted's offer has, which names both job workflow files; for a public product both offers are available; with a need of a Bridge or of a runner both offers are unavailable, the hosted one with the reason ci-hosted's offer has, naming the resource and its route
test("routesFor — the hosted offer of an endpoint is available exactly when a CI agent's hosted offer is, with its reason otherwise", () => {
  const hostedOffer = (product, needs) => routesFor(ENDPOINT_WITH_SECRET, product, needs)[1];
  const ciAgentOffer = (product, needs) => routesFor(HOSTED, product, needs)[0];

  const noWorkflow = { visibility: "private", jobWorkflow: false };
  assert.deepEqual(routesFor(ENDPOINT_WITH_SECRET, noWorkflow, [])[0], TAB_OFFER);
  assertRefused(hostedOffer(noWorkflow, []), WORKFLOW_FILES, "the endpoint's hosted offer without the job workflow");
  assert.equal(hostedOffer(noWorkflow, []).reason, ciAgentOffer(noWorkflow, []).reason);

  assert.deepEqual(routesFor(ENDPOINT_WITH_SECRET, { visibility: "public", jobWorkflow: true }, []), [TAB_OFFER, HOSTED_OFFER]);

  for (const need of [BRIDGE_NEED, RUNNER_NEED]) {
    const found = routesFor(ENDPOINT_WITH_SECRET, PRIVATE, [need]);
    assert.deepEqual(found.map((offer) => offer.route), [{ kind: "tab" }, { kind: "ci", runner: "hosted" }]);
    assertRefused(found[0], [need.resource, need.route], `the tab for ${need.route}`);
    assertRefused(found[1], [need.resource, need.route], `the hosted runners for ${need.route}`);
    assert.equal(found[1].reason, ciAgentOffer(PRIVATE, [need]).reason);
  }
});

// ---------------------------------------------------------------- a coding agent on CI

// TST-20261109302 · level: unit · module: MOD-runtimes
// guards: A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY; A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; UC-010
// given: two agents on coding agents on CI — one on the server's runners (`ci hosted agent claude secret CLAUDE_KEY`), one on the self-hosted runner gpu (`ci runner:gpu agent claude secret CLAUDE_KEY`); a private product with the job workflow, a public one, and a job that needs `runner:gpu`
// input: routesFor(each, product, needs)
// expect: the first is offered on the server's runners, the second on the runner gpu, both available for the private product; for the public product the runner is refused naming the runner and the visibility; with the need of runner:gpu only the second is available
test("routesFor — a coding agent on CI is offered on the server's runners or on the self-hosted runner its route names", () => {
  const onCi = (route) => ({ name: "dev-a", type: "CI agent", model: "example-model", context: 200000, capabilities: ["run code and tests"], place: "GitHub", route });
  const hosted = onCi("ci hosted agent claude secret CLAUDE_KEY"), gpu = onCi("ci runner:gpu agent claude secret CLAUDE_KEY");
  assert.deepEqual(routesFor(hosted, PRIVATE, []), [{ route: { kind: "ci", runner: "hosted" }, available: true, reason: null }]);
  assert.deepEqual(routesFor(gpu, PRIVATE, []), [{ route: { kind: "ci", runner: "gpu" }, available: true, reason: null }]);
  assertRefused(routesFor(gpu, { visibility: "public", jobWorkflow: true }, [])[0], ["gpu", "public"], "gpu on a public product");
  assert.equal(routesFor(hosted, PRIVATE, [RUNNER_NEED])[0].available, false);
  assert.equal(routesFor(gpu, PRIVATE, [RUNNER_NEED])[0].available, true);
});
