// MOD-resource-list's readPin, checkPlan and newerState (ITM-461), as the accepted text of docs/architecture/MOD-resource-list.md states them:
// "`readPin(resource, readers: { repositoryHead, hubRevision }) -> Promise<Pin>` — the current state upstream, read through the readers the caller hands in: the
// repository host's head, or the Hub's revision. It crosses the network through them and fails as they fail; a Hub that does not answer a browser is named, and
// the person pastes a full revision instead"; "`checkPlan(resource) -> CheckPlan` — how a resource is checked: read on its host for a repository, data or a model; a
// harmless probe through the Bridge its route names for compute reached by a Bridge and for an endpoint or agent — its served models, a cluster's partitions —; a
// check job on the runner's label for compute reached by a runner (UC-040)"; "`newerState(resource, upstream) -> { newer, upstream }` — whether a newer state exists.
// It moves nothing: a pin changes only when a person moves it and the list is committed". For UC-040 (steps 3 and 7, 3b).
// Run: node --test tests/resource-list-pin.test.mjs
//
// Module: MOD-resource-list
// Guards: UC-040; A RESOURCE IS PINNED TO AN EXACT STATE; A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT; A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER
// Level: unit
//
// The readers are fakes of the test, which record what they were asked; no request is made. Where the file leaves a reading open, the test states the one it takes,
// and the pull request names it:
//   - Only a repository, data and a model have an upstream state to read: a repository's is a Pin of kind `commit`, the head the repository host's reader gives; data's and a model's is
//     a Pin of kind `revision`, the Hub's revision for the resource's address. Compute, an endpoint and an agent are read by the probes of checkPlan, not by readPin: it
//     rejects with `NothingToRead { kind }` and asks no reader.
//   - A reader's failure is passed on as the reader made it. A Hub that does not answer a browser — its reader rejects with a plain TypeError or Error, which is how a browser
//     reports a call that did not come back — is rejected with `HubNotAnswering { resource, address }`, whose message tells the person to paste a full revision.
//   - checkPlan's probes: an endpoint's is `served models`, an agent's `answers`, compute's `partitions`. An endpoint or agent whose route is its own address, called directly
//     by a browser or a runner, is `read on its host`. A compute resource whose route is neither a Bridge nor a runner throws `NoCheckRoute { route }`.
//   - newerState compares the pin written in the list with the upstream Pin's value: any difference is newer, an equal one is not; the resource and the upstream Pin are not changed.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as resourceList from "../src/resource-list/index.mjs";

const { readPin, checkPlan, newerState } = resourceList;
const COMMIT = "0123456789abcdef0123456789abcdef01234567";
const NEWER = "fedcba9876543210fedcba9876543210fedcba98";

const resource = (kind, change = {}) => ({ name: `a-${kind}`, kind, address: `address-of-${kind}`, pin: kind === "compute" ? null : "pinned", licence: null, maintainer: null,
  route: kind === "compute" ? "runner:gpu" : "read", place: null, paid: null, secret: null, ...change });
// Readers that record their questions and answer as given.
function readers({ head = NEWER, revision = "rev-2", headFails = null, hubFails = null } = {}) {
  const asked = [];
  return { asked,
    repositoryHead: async (address) => { asked.push(["head", address]); if (headFails) throw headFails; return head; },
    hubRevision: async (id) => { asked.push(["hub", id]); if (hubFails) throw hubFails; return { revision, licence: "MIT" }; } };
}
const named = (name, message = name) => Object.assign(new Error(message), { name });

// ---------------------------------------------------------------- readPin

// guards: A RESOURCE IS PINNED TO AN EXACT STATE; UC-040 (3)
// given: a repository, a data and a model resource, and readers answering head NEWER and Hub revision "rev-2"
// input: readPin of each
// expect: the repository's Pin is { kind: "commit", value: NEWER }, read by the repository reader for its address alone; data's and the model's { kind: "revision", value: "rev-2" },
//         read by the Hub reader for their addresses alone
test("readPin reads a repository's head and a Hub resource's revision through the readers", async () => {
  const repository = readers();
  assert.deepEqual(await readPin(resource("repository"), repository), { kind: "commit", value: NEWER });
  assert.deepEqual(repository.asked, [["head", "address-of-repository"]]);
  for (const kind of ["data", "model"]) {
    const hub = readers();
    assert.deepEqual(await readPin(resource(kind), hub), { kind: "revision", value: "rev-2" }, kind);
    assert.deepEqual(hub.asked, [["hub", `address-of-${kind}`]], kind);
  }
});

// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; UC-040 (3b)
// given: a repository reader that rejects with a RateLimited error, a Hub reader that rejects with a TokenRefused error, and a Hub reader that rejects with a TypeError "Failed to fetch"
// input: readPin of a repository, a data resource and a model; the answering readers first shown to answer
// expect: the first two failures are passed on as the readers made them, the same error; the third is HubNotAnswering naming the resource and its address, whose message
//         tells the person to paste a full revision
test("a reader's failure is passed on, and a Hub that does not answer is named", async () => {
  assert.equal((await readPin(resource("data"), readers())).value, "rev-2", "known positive");
  const limited = named("RateLimited"), refused = named("TokenRefused");
  await assert.rejects(readPin(resource("repository"), readers({ headFails: limited })), (error) => error === limited);
  await assert.rejects(readPin(resource("data"), readers({ hubFails: refused })), (error) => error === refused);
  await assert.rejects(readPin(resource("model", { name: "weights", address: "acme/small" }), readers({ hubFails: new TypeError("Failed to fetch") })), (error) => {
    assert.equal(error.name, "HubNotAnswering");
    assert.equal(error.resource, "weights");
    assert.equal(error.address, "acme/small");
    assert.match(error.message, /paste a full revision/);
    return true;
  });
});

// guards: A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER; UC-040
// given: a compute resource, an endpoint and an agent
// input: readPin of each
// expect: each rejects with NothingToRead naming its kind, and no reader was asked
test("readPin reads nothing upstream for compute, an endpoint or an agent", async () => {
  for (const kind of ["compute", "endpoint", "agent"]) {
    const none = readers();
    await assert.rejects(readPin(resource(kind), none), (error) => error.name === "NothingToRead" && error.kind === kind, kind);
    assert.deepEqual(none.asked, [], kind);
  }
});

// ---------------------------------------------------------------- checkPlan

// guards: A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER; UC-040 (4c)
// given: a repository, data and a model, whatever their route says; compute by `bridge lab-pc` and by `runner:gpu`; an endpoint and an agent by `bridge workstation`, by `runner:cpu`, and by their own address
// input: checkPlan of each
// expect: read on its host for the first three; compute by Bridge probes `partitions` through the Bridge named; compute by runner is a check job on the label; an endpoint
//         probes `served models` and an agent `answers` through the Bridge their route names; either by a runner is a check job on its label; by their own address read on
//         their host
test("checkPlan names how each kind and route is checked, the Bridge and the runner from the route", () => {
  for (const kind of ["repository", "data", "model"]) assert.deepEqual(checkPlan(resource(kind, { route: "bridge lab-pc" })), { how: "read on its host" }, kind);
  assert.deepEqual(checkPlan(resource("compute", { route: "bridge lab-pc" })), { how: "probe through the Bridge", bridge: "lab-pc", probe: "partitions" });
  assert.deepEqual(checkPlan(resource("compute", { route: "runner:gpu" })), { how: "check job on a runner", label: "gpu" });
  assert.deepEqual(checkPlan(resource("endpoint", { route: "bridge workstation" })), { how: "probe through the Bridge", bridge: "workstation", probe: "served models" });
  assert.deepEqual(checkPlan(resource("agent", { route: "bridge workstation" })), { how: "probe through the Bridge", bridge: "workstation", probe: "answers" });
  for (const kind of ["endpoint", "agent"]) {
    assert.deepEqual(checkPlan(resource(kind, { route: "runner:cpu" })), { how: "check job on a runner", label: "cpu" }, kind);
    assert.deepEqual(checkPlan(resource(kind, { route: "http://workstation.example.org:8000/v1" })), { how: "read on its host" }, kind);
  }
});

// guards: A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER
// given: a compute resource whose route is `ssh gpu`, `bridge` and `runner:`; one by `bridge lab-pc` first
// input: checkPlan of each
// expect: the first is planned; each other throws NoCheckRoute naming the route
test("checkPlan refuses a compute route that names neither a Bridge nor a runner", () => {
  assert.equal(checkPlan(resource("compute", { route: "bridge lab-pc" })).bridge, "lab-pc", "known positive");
  for (const route of ["ssh gpu", "bridge", "runner:"]) {
    assert.throws(() => checkPlan(resource("compute", { route })), (error) => error.name === "NoCheckRoute" && error.route === route, route);
  }
});

// ---------------------------------------------------------------- newerState

// guards: A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT; UC-040 (7)
// given: a repository pinned to COMMIT, frozen deeply; upstream Pins of kind commit with value NEWER and with value COMMIT; a data resource pinned to "rev-1" and upstream "rev-2"
// input: newerState of each
// expect: NEWER → { newer: true, upstream: the same Pin }; COMMIT → { newer: false, upstream }; "rev-2" against "rev-1" newer; the resource's pin is as it was and the upstream Pin is the
//         object that was given
test("newerState finds a newer state and leaves the resource's own pin as it was", () => {
  const pinned = Object.freeze(resource("repository", { pin: COMMIT }));
  const newer = Object.freeze({ kind: "commit", value: NEWER }), same = Object.freeze({ kind: "commit", value: COMMIT });
  const found = newerState(pinned, newer);
  assert.deepEqual(found, { newer: true, upstream: newer });
  assert.equal(found.upstream, newer);
  assert.deepEqual(newerState(pinned, same), { newer: false, upstream: same });
  assert.equal(newerState(resource("data", { pin: "rev-1" }), { kind: "revision", value: "rev-2" }).newer, true);
  assert.equal(newerState(resource("data", { pin: "rev-1" }), { kind: "revision", value: "rev-1" }).newer, false);
  assert.equal(pinned.pin, COMMIT);
});
