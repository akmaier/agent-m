// The routes a participant offers (ITM-318, ITM-494) — MOD-runtimes' routesFor(participant, participants, product, needs), as the accepted text of
// docs/architecture/MOD-runtimes.md states it (Interfaces: Route, RouteOffer, ResourceNeed, routesFor), for UC-005 step 3, UC-010
// step 1, UC-011 1c and 1d, UC-017 step 3 and UC-049 1b and 4a: from a participant's route in the register — `endpoint <name>`, `endpoint <name>
// secret <NAME>`, `ci hosted secret <NAME>`, `ci runner:<label> secret <NAME>`, `bridge <bridge> agent <agent>`, `through <participant>` — the
// routes it offers: a model endpoint in the tab, and, where its route names the CI secret of its key, on the server's runners too; a
// CI agent on the server's runners, or on its self-hosted runner only for a product the server reports private, refused with the
// reason otherwise; a CLI or sandboxed agent through the Bridge its route names; a subagent the offers of the participant it is reached
// through, none when MOD-participant-list's eligible leaves it out; the CI route unavailable, naming the job workflow's
// files, while the product has none; a job that needs a resource offered only on the routes that reach it — for `bridge <name>` a
// participant whose route names that Bridge, for `runner:<label>` that runner. The pages that call it (ITM-361 to ITM-363, ITM-352)
// are not part of this item. ITM-494 changes how the tests of ITM-318 call routesFor — the register is passed — and no expected result of them.
// Run: node --test tests/runtimes-routes.test.mjs
//
// Module: MOD-runtimes
// Guards: UC-005; UC-007; UC-010; UC-011; UC-017; UC-019; A RUNTIME IS INTERCHANGEABLE; AGENT M WORKS WITHOUT A LOCAL INSTALLATION
// Guards: A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY; A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// Level: unit
//
// routesFor is pure: it is given a participant — a row of the register as MOD-participant-list's participantsOf gives it, of which it
// reads the `route` —, the participants of the register, the product's visibility and whether it holds the job workflow, and the needs, and answers with one offer for
// the participant's one route, or, for a model endpoint that names the CI secret of its key, with two, and, for a subagent, with the offers of the participant it is reached through. A refusal's words are the code's; a test asks of an offer that it is unavailable, that its reason is one
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
// The register the participants are of (routesFor is given it besides the participant; none of these six is a subagent).
const REGISTER = [...ALL, RUNNER_WORKSTATION, BRIDGE_GPU, PERSON];

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
  const found = routesFor(each, REGISTER, product, needs);
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
// input: routesFor(participant, the register, the product, [])
// expect: for each of the six one offer, available with no reason, of the route it names — the tab; CI on the server's runners; CI on the runner gpu, and on cpu; the Bridge workstation, and lab-pc —; no offer for the person
test("routesFor — each route form is offered on the route it names, and a person on none", () => {
  const found = offers(PRIVATE, []);

  for (const each of ALL) assert.deepEqual(found[each.name], { route: route[each.name], available: true, reason: null }, each.name);
  assert.deepEqual(routesFor(PERSON, REGISTER, PRIVATE, []), []);
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

// ---------------------------------------------------------------- a subagent

// A subagent: a CLI agent whose route is `through <participant>`. The module file leaves three things unstated; the tests take these readings: a subagent
// reached through a subagent has the offers of that one's starter (the "same rules as that participant's own" applied again); a chain that comes back to
// a participant already passed has none (it ends in no participant that is reached by a Bridge, a runner or the tab); and a starter that is a sandboxed
// agent is no CLI agent, as MOD-participant-list's eligible reads the type.
const subagent = (name, through) => participant(name, "CLI agent", `through ${through}`);
const SUB_OF_WORKSTATION = subagent("sub-a", "cli-workstation");
const SUB_OF_SUB = subagent("sub-b", "sub-a");
const BRIDGE_WORKSTATION_OFFER = { route: { kind: "bridge", bridge: "workstation" }, available: true, reason: null };
// The register of the subagent tests: the register above and two subagents.
const WITH_SUBS = [...REGISTER, SUB_OF_WORKSTATION, SUB_OF_SUB];

// TST-494001 · level: unit · module: MOD-runtimes
// guards: A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE; UC-017; UC-049 (1b)
// given: a register with the CLI agent cli-workstation (route `bridge workstation agent claude`) and the subagent sub-a (route `through cli-workstation`); a private product that holds the job workflow
// input: routesFor(sub-a, the register, the product, []); and routesFor(cli-workstation, …) as the known positive
// expect: for cli-workstation one offer `{ route: { kind: "bridge", bridge: "workstation" }, available: true, reason: null }`; for sub-a exactly the same one offer
test("routesFor — a subagent through a CLI agent of the register has that agent's offer", () => {
  assert.deepEqual(routesFor(WORKSTATION, WITH_SUBS, PRIVATE, []), [BRIDGE_WORKSTATION_OFFER], "known positive: the CLI agent's own offer");
  assert.deepEqual(routesFor(SUB_OF_WORKSTATION, WITH_SUBS, PRIVATE, []), [BRIDGE_WORKSTATION_OFFER]);
});

// TST-494002 · level: unit · module: MOD-runtimes
// guards: A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE; UC-049 (1b)
// given: the register of TST-494001 and a private product that holds the job workflow
// input: routesFor(sub-a, the register, the product, needs) for a need reached by `bridge workstation`, and for one reached by `bridge lab-pc`
// expect: for the need `bridge workstation` sub-a's offer is the Bridge workstation, available with no reason; for the need `bridge lab-pc` it is the same route, unavailable, with a reason of one line that names the resource and `bridge lab-pc`
test("routesFor — a subagent's offer is judged by the rules of the participant it is reached through", () => {
  assert.deepEqual(routesFor(SUB_OF_WORKSTATION, WITH_SUBS, PRIVATE, [BRIDGE_NEED]), [BRIDGE_WORKSTATION_OFFER]);

  const labNeed = { resource: "the lab's GPU", route: "bridge lab-pc" };
  const refused = routesFor(SUB_OF_WORKSTATION, WITH_SUBS, PRIVATE, [labNeed]);
  assert.equal(refused.length, 1);
  assert.deepEqual(refused[0].route, { kind: "bridge", bridge: "workstation" });
  assertRefused(refused[0], [labNeed.resource, "bridge lab-pc"], "sub-a for a need of lab-pc");
});

// TST-494003 · level: unit · module: MOD-runtimes
// guards: UC-017; UC-049 (1b)
// given: a register with cli-workstation (a CLI agent), drafter-a (a model endpoint), ci-hosted (a CI agent), cli-lab (a sandboxed agent) and six subagents, reached through: sub-a → cli-workstation; sub-self → sub-self; sub-nobody → nobody (no participant of the register); sub-endpoint → drafter-a; sub-ci → ci-hosted; sub-sandbox → cli-lab
// input: routesFor(each subagent, the register, a private product with the job workflow, [])
// expect: sub-a has one offer, the Bridge workstation, available; sub-self, sub-nobody, sub-endpoint, sub-ci and sub-sandbox have none — an empty list, no unavailable offer
test("routesFor — a subagent through itself, through no CLI agent or through nobody has no offer", () => {
  const subs = {
    "sub-a": subagent("sub-a", "cli-workstation"), "sub-self": subagent("sub-self", "sub-self"), "sub-nobody": subagent("sub-nobody", "nobody"),
    "sub-endpoint": subagent("sub-endpoint", "drafter-a"), "sub-ci": subagent("sub-ci", "ci-hosted"), "sub-sandbox": subagent("sub-sandbox", "cli-lab"),
  };
  const register = [...ALL, ...Object.values(subs)];

  assert.deepEqual(routesFor(subs["sub-a"], register, PRIVATE, []), [BRIDGE_WORKSTATION_OFFER], "known positive");
  for (const name of ["sub-self", "sub-nobody", "sub-endpoint", "sub-ci", "sub-sandbox"]) assert.deepEqual(routesFor(subs[name], register, PRIVATE, []), [], name);
});

// TST-494004 · level: unit · module: MOD-runtimes
// guards: UC-017; UC-049 (1b)
// given: the register of TST-494001, in which sub-b is reached through sub-a, which is reached through cli-workstation; and a register in which cyc-a is reached through cyc-b and cyc-b through cyc-a, with cli-workstation also in it
// input: routesFor(sub-b, …, []); routesFor(cyc-a, …, []); routesFor(cyc-b, …, [])
// expect: sub-b has the one offer of the Bridge workstation, available; cyc-a and cyc-b have none, and each call returns
test("routesFor — a subagent of a subagent has the first starter's offer, and a ring of subagents none", () => {
  assert.deepEqual(routesFor(SUB_OF_SUB, WITH_SUBS, PRIVATE, []), [BRIDGE_WORKSTATION_OFFER]);

  const ring = [subagent("cyc-a", "cyc-b"), subagent("cyc-b", "cyc-a"), WORKSTATION];
  assert.deepEqual(routesFor(ring[0], ring, PRIVATE, []), []);
  assert.deepEqual(routesFor(ring[1], ring, PRIVATE, []), []);
});

// ---------------------------------------------------------------- an endpoint whose key is a CI secret

const ENDPOINT_WITH_SECRET = participant("drafter-s", "model endpoint", "endpoint fau-nhr secret NHR_KEY");
const TAB_OFFER = { route: { kind: "tab" }, available: true, reason: null };
const HOSTED_OFFER = { route: { kind: "ci", runner: "hosted" }, available: true, reason: null };

// TST-494005 · level: unit · module: MOD-runtimes
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; AGENT M WORKS WITHOUT A LOCAL INSTALLATION; UC-049 (4a)
// given: drafter-s, a model endpoint whose route is `endpoint fau-nhr secret NHR_KEY`; a private product that holds the job workflow
// input: routesFor(drafter-s, the register, the product, []); and, as the known negative, routesFor(drafter-a, …), whose route `endpoint fau-nhr` names no secret
// expect: for drafter-s two offers, in this order: the tab `{ route: { kind: "tab" }, available: true, reason: null }`, then `{ route: { kind: "ci", runner: "hosted" }, available: true, reason: null }`; for drafter-a the one offer of the tab
test("routesFor — an endpoint whose route names the CI secret of its key is offered in the tab and on the server's runners", () => {
  const register = [...REGISTER, ENDPOINT_WITH_SECRET];

  assert.deepEqual(routesFor(ENDPOINT_WITH_SECRET, register, PRIVATE, []), [TAB_OFFER, HOSTED_OFFER]);
  assert.deepEqual(routesFor(ENDPOINT, register, PRIVATE, []), [TAB_OFFER], "known negative: no secret, no server's runners");
});

// TST-494006 · level: unit · module: MOD-runtimes
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; AGENT M WORKS WITHOUT A LOCAL INSTALLATION; UC-010
// given: drafter-s of TST-494005; ci-hosted (a CI agent on the server's runners), whose hosted offer the endpoint's follows
// input: routesFor with a private product without the job workflow; with a public product that holds it; with a job that needs `bridge workstation`; with a job that needs `runner:gpu`
// expect: without the job workflow the tab is available and the hosted offer is unavailable with the reason ci-hosted's offer has, which names both job workflow files; for a public product both offers are available; with a need of a Bridge or of a runner both offers are unavailable, the hosted one with the reason ci-hosted's offer has, naming the resource and its route
test("routesFor — the hosted offer of an endpoint is available exactly when a CI agent's hosted offer is, with its reason otherwise", () => {
  const register = [...REGISTER, ENDPOINT_WITH_SECRET];
  const hostedOffer = (product, needs) => routesFor(ENDPOINT_WITH_SECRET, register, product, needs)[1];
  const ciAgentOffer = (product, needs) => routesFor(HOSTED, register, product, needs)[0];

  const noWorkflow = { visibility: "private", jobWorkflow: false };
  assert.deepEqual(routesFor(ENDPOINT_WITH_SECRET, register, noWorkflow, [])[0], TAB_OFFER);
  assertRefused(hostedOffer(noWorkflow, []), WORKFLOW_FILES, "the endpoint's hosted offer without the job workflow");
  assert.equal(hostedOffer(noWorkflow, []).reason, ciAgentOffer(noWorkflow, []).reason);

  assert.deepEqual(routesFor(ENDPOINT_WITH_SECRET, register, { visibility: "public", jobWorkflow: true }, []), [TAB_OFFER, HOSTED_OFFER]);

  for (const need of [BRIDGE_NEED, RUNNER_NEED]) {
    const found = routesFor(ENDPOINT_WITH_SECRET, register, PRIVATE, [need]);
    assert.deepEqual(found.map((offer) => offer.route), [{ kind: "tab" }, { kind: "ci", runner: "hosted" }]);
    assertRefused(found[0], [need.resource, need.route], `the tab for ${need.route}`);
    assertRefused(found[1], [need.resource, need.route], `the hosted runners for ${need.route}`);
    assert.equal(found[1].reason, ciAgentOffer(PRIVATE, [need]).reason);
  }
});
