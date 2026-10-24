// What is blocked by the modules an item uses — MOD-progress-measures' blocked, as the accepted text of
// docs/architecture/MOD-progress-measures.md states it: "for a held module, the other team's sprint and the module, as MOD-work-plans'
// `conflicts` gives them over `held` and `modules`", where `modules` is a Facts field: "the architecture's module files it is computed
// with". MOD-work-plans' `conflicts` holds an item that changes a module another team's held item changes or uses, and an item that uses a
// module another team's held item changes (SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES). Of the modules an item
// uses, this is blocked alone.
// Run: node --test tests/progress-measures-blocked-uses.test.mjs
//
// Module: MOD-progress-measures
// Guards: UC-035; SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). The facts are held in memory, in the form of
// MOD-progress-measures' Facts (tests/progress-measures-facts.mjs): the item states are MOD-work-plans' ItemState, the held items its Held,
// the plan's items documents with the `modules` front matter an item has, and `modules` the architecture's module files, each with the
// `uses` front matter a module file has. `fetch` is replaced by a spy for every test and must not have been called when the test ends.
// The counter-proofs are recorded in the pull request.

import test, { afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { blocked } from "../src/progress-measures/index.mjs";
import { facts, itemState } from "./progress-measures-facts.mjs";

let fetched = [];
const realFetch = globalThis.fetch;
beforeEach(() => {
  fetched = [];
  globalThis.fetch = async (input) => { fetched.push(String(input?.url ?? input)); throw new Error("a test reached the network"); };
});
afterEach(() => {
  globalThis.fetch = realFetch;
  assert.deepEqual(fetched, [], "no request reaches the network");
});

const SPRINT1 = "docs/backlog/sprints/team1/03.md", SPRINT2 = "docs/backlog/sprints/team2/05.md", SPRINT3 = "docs/backlog/sprints/team3/01.md";
const SPRINT_OF = { team1: SPRINT1, team2: SPRINT2, team3: SPRINT3 };
const held = (item, team, changes, uses = []) => ({ item, team, sprint: SPRINT_OF[team], changes, uses });
const item = (id, modules) => ({ id, path: `docs/backlog/${id}.md`, fields: { id, modules } });
const moduleFile = (id, uses = []) => ({ id, path: `docs/architecture/${id}.md`, fields: { id, uses } });
const NO_LIMIT = { flow: { wip: null, timeBox: null, sprints: true } };
const ready = (...ids) => ids.map((id) => itemState(id, "ready"));

// TST-1161001 · level: unit · module: MOD-progress-measures
// guards: SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES; UC-035
// given: ITM-031 ready in team1's sprint, changing MOD-view, whose module file uses MOD-store.read and MOD-store.write; ITM-040, held by team2's sprint, changing MOD-store and nothing else; ITM-032 ready in team1's sprint, changing MOD-other, whose module file uses nothing
// input: blocked(facts), with facts.modules the module files MOD-view, MOD-store and MOD-other
// expect: exactly one entry — ITM-031 "held by another team's sprint", naming MOD-store, ITM-040 and team2's sprint, a module ITM-031 uses and ITM-040 changes; ITM-032 is not blocked
test("blocked — a ready item is held by another team's sprint for a module it uses that a held item of that team changes", () => {
  assert.deepEqual(blocked(facts({
    model: NO_LIMIT,
    plan: { order: null, items: [item("ITM-031", ["MOD-view"]), item("ITM-032", ["MOD-other"])], states: ready("ITM-031", "ITM-032") },
    held: [held("ITM-031", "team1", ["MOD-view"], ["MOD-store"]), held("ITM-032", "team1", ["MOD-other"]), held("ITM-040", "team2", ["MOD-store"])],
    modules: [moduleFile("MOD-view", ["MOD-store.read", "MOD-store.write"]), moduleFile("MOD-store"), moduleFile("MOD-other")],
  })), [{ item: "ITM-031", reason: "held by another team's sprint", detail: `MOD-store is held by ITM-040 in ${SPRINT2} of team2` }]);
});

// TST-1161002 · level: unit · module: MOD-progress-measures
// guards: SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES; UC-035
// given: the product of TST-1161001, three times with one thing different: (a) the module file MOD-view uses nothing; (b) ITM-040 is held by team1's own sprint; (c) facts.modules is empty
// input: blocked(facts) of each
// expect: counter-proofs: none lists an entry — in (a) ITM-031 uses no module ITM-040 changes, in (b) a module held by its own team's sprint keeps nothing from the team, in (c) no module file says what ITM-031's module uses, and a use is not guessed
test("blocked — an item is not held through a module it does not use, nor through one its own team's sprint holds, nor without the module files", () => {
  const states = ready("ITM-031");
  const plan = { order: null, items: [item("ITM-031", ["MOD-view"])], states };
  const given = (over) => blocked(facts({
    model: NO_LIMIT, plan,
    held: [held("ITM-031", "team1", ["MOD-view"]), held("ITM-040", "team2", ["MOD-store"])],
    modules: [moduleFile("MOD-view", ["MOD-store.read"]), moduleFile("MOD-store")], ...over,
  }));
  assert.equal(given({}).length, 1, "known positive: the case of TST-1161001 is held");
  assert.deepEqual(given({ modules: [moduleFile("MOD-view"), moduleFile("MOD-store")] }), []);
  assert.deepEqual(given({ held: [held("ITM-031", "team1", ["MOD-view"]), held("ITM-040", "team1", ["MOD-store"])] }), []);
  assert.deepEqual(given({ modules: [] }), []);
});

// TST-1161003 · level: unit · module: MOD-progress-measures
// guards: SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES; UC-035
// given: ITM-031 ready in team1's sprint, changing MOD-view and MOD-lib, MOD-view's file using MOD-store.read; ITM-040 held by team2's sprint, changing MOD-store and using MOD-lib; ITM-041 held by team3's sprint, changing MOD-lib
// input: blocked(facts), with facts.modules the module files MOD-view, MOD-lib and MOD-store
// expect: one entry for ITM-031, whose detail lists, in the order of the held items and, within an item, of the modules: MOD-lib with ITM-040 (a module ITM-031 changes that ITM-040 uses), MOD-store with ITM-040 (a module ITM-031 uses that ITM-040 changes), MOD-lib with ITM-041 (a module both change) — each with its sprint and team, joined by "; "
test("blocked — an item held by several sprints names each held item and module in one entry, whether the item changes the module or uses it", () => {
  assert.deepEqual(blocked(facts({
    model: NO_LIMIT,
    plan: { order: null, items: [item("ITM-031", ["MOD-view", "MOD-lib"])], states: ready("ITM-031") },
    held: [held("ITM-031", "team1", ["MOD-view", "MOD-lib"], ["MOD-store"]), held("ITM-040", "team2", ["MOD-store"], ["MOD-lib"]),
      held("ITM-041", "team3", ["MOD-lib"])],
    modules: [moduleFile("MOD-view", ["MOD-store.read"]), moduleFile("MOD-lib"), moduleFile("MOD-store")],
  })), [{
    item: "ITM-031", reason: "held by another team's sprint",
    detail: `MOD-lib is held by ITM-040 in ${SPRINT2} of team2; MOD-store is held by ITM-040 in ${SPRINT2} of team2; MOD-lib is held by ITM-041 in ${SPRINT3} of team3`,
  }]);
});

// TST-1161004 · level: unit · module: MOD-progress-measures
// guards: SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES; UC-035
// given: ITM-031 ready, changing MOD-view, held by team1's sprint and also by team2's sprint, which holds it changing MOD-zzz — a hold by another team that shares no module with it
// input: blocked(facts)
// expect: one entry for ITM-031 "held by another team's sprint", whose detail names the item and team2's sprint and no module: "ITM-031 is held in <team2's sprint> of team2" — the hold of the item itself, which MOD-work-plans' conflicts gives with an empty module
test("blocked — an item that another team's sprint holds itself is held by that sprint, with no module named", () => {
  assert.deepEqual(blocked(facts({
    model: NO_LIMIT,
    plan: { order: null, items: [item("ITM-031", ["MOD-view"])], states: ready("ITM-031") },
    held: [held("ITM-031", "team1", ["MOD-view"]), held("ITM-031", "team2", ["MOD-zzz"])],
    modules: [moduleFile("MOD-view"), moduleFile("MOD-zzz")],
  })), [{ item: "ITM-031", reason: "held by another team's sprint", detail: `ITM-031 is held in ${SPRINT2} of team2` }]);
});
