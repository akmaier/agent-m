// MOD-work-plans' sprintsToClose (ITM-1032), as the accepted text of docs/architecture/MOD-work-plans.md states it (blob ee571b6be5a5484c57d66e0f110c9aa2a1d82b5b, :187-191): "`sprintsToClose(sprints: Document[], states: ItemState[],
// today: string) -> Array<{ sprint: string, closer: string, because: "time box ended" | "every selected item done" | "ended by the Product Owner" }>` — every sprint whose record holds no `## Review` and that has ended: its `end` date
// is before or on `today`; or, without a time box, every item of its selection is `done`, or its record holds `## Ended`; each with its `closer` (UC-041, an agent's close; `A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF`). It reads nothing."
// Run: node --test tests/work-plans-sprints-to-close.test.mjs
//
// Module: MOD-work-plans
// Guards: UC-041; A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF; A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT
// Level: unit
//
// The readings, named in the pull request: a record that stands in no team's folder is no sprint (sprintOf) and is not named; the sprints come in the order given; where a sprint without a time box holds `## Ended` and also has every item done,
// its cause is `ended by the Product Owner`, the explicit act; the days are the dates of the front matter and `today` as `yyyy-mm-dd`. Sprint records are read with planSchemas.sprint through MOD-documents' readDocument. Each test states
// its input and its expected result before it runs (given / input / expect). Nothing reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readDocument } from "../src/documents/index.mjs";
import { planSchemas, sprintsToClose } from "../src/work-plans/index.mjs";

function sprint(team, nn, { selection = ["ITM-001"], end = "", closer = "ci-bot", appended = [] } = {}) {
  const text = ["---", `sprint: ${Number(nn)}`, "goal: The fixture sprint's goal", "start: 2026-10-12", `end: ${end}`.trimEnd(), `closer: ${closer}`, "branch:", "selection:", ...selection.map((id) => `  - ${id}`), "---",
    `# ${team} Sprint ${nn}`, "", ...appended, ""].join("\n");
  return readDocument(planSchemas.sprint, `docs/backlog/sprints/${team}/${nn}.md`, text);
}
const state = (item, name) => ({ item, state: name });
const REVIEW = ["## Review", "", "closed."];
const ENDED = ["## Ended", "", "at: 2026-10-14"];

// TST-1032001 · level: unit · module: MOD-work-plans
// guards: UC-041; A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF
// given: today is 2026-10-19; team1/01 ends 2026-10-18, team1/02 ends 2026-10-19, team1/03 ends 2026-10-20, team1/04 ends 2026-10-18 but holds `## Review`; the closers are ci-bot, ci-bot, ci-bot, alice
// input: sprintsToClose of the four with no item state
// expect: team1/01 and team1/02 are named, each with its closer ci-bot and the cause "time box ended"; team1/03 (the time box ends tomorrow) and team1/04 (closed already) are not
// Planted fault: comparing with `<` instead of `<=` leaves team1/02 out; ignoring `## Review` names team1/04.
test("a sprint whose time box ended, on or before today, and that holds no review, is named with its closer", () => {
  const sprints = [sprint("team1", "01", { end: "2026-10-18" }), sprint("team1", "02", { end: "2026-10-19" }), sprint("team1", "03", { end: "2026-10-20" }),
    sprint("team1", "04", { end: "2026-10-18", closer: "alice", appended: REVIEW })];
  assert.deepEqual(sprintsToClose(sprints, [], "2026-10-19"), [{ sprint: "team1/01", closer: "ci-bot", because: "time box ended" }, { sprint: "team1/02", closer: "ci-bot", because: "time box ended" }]);
});

// TST-1032002 · level: unit · module: MOD-work-plans
// guards: UC-041; A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF
// given: sprints without a time box: team2/01 selecting ITM-001 and ITM-002, both done; team2/02 selecting ITM-003 (done) and ITM-004 (in progress); team2/03 selecting ITM-004 and holding `## Ended`; team2/04 selecting ITM-005 (done) and holding `## Review`
// input: sprintsToClose with the states of the items, today 2026-10-19
// expect: team2/01 "every selected item done"; team2/03 "ended by the Product Owner"; team2/02 (one item not done) and team2/04 (closed) are not named
// Planted fault: naming a sprint when any item is done, or not reading `## Ended`, changes the list.
test("without a time box a sprint is named when every item of its selection is done, or its record holds `## Ended`", () => {
  const sprints = [sprint("team2", "01", { selection: ["ITM-001", "ITM-002"] }), sprint("team2", "02", { selection: ["ITM-003", "ITM-004"] }), sprint("team2", "03", { selection: ["ITM-004"], appended: ENDED }),
    sprint("team2", "04", { selection: ["ITM-005"], appended: REVIEW })];
  const states = [state("ITM-001", "done"), state("ITM-002", "done"), state("ITM-003", "done"), state("ITM-004", "in progress"), state("ITM-005", "done")];
  assert.deepEqual(sprintsToClose(sprints, states, "2026-10-19"), [{ sprint: "team2/01", closer: "ci-bot", because: "every selected item done" }, { sprint: "team2/03", closer: "ci-bot", because: "ended by the Product Owner" }]);
});

// TST-1032003 · level: unit · module: MOD-work-plans
// guards: UC-041
// given: a sprint with a time box that has not ended whose items are all done; a sprint with a time box that ended, whose items are not done; a record outside any team's folder
// input: sprintsToClose, today 2026-10-19
// expect: the first is not named (a time box ends the sprint, the items do not); the second is, "time box ended"; the record outside a team's folder is named by none; the inputs are not changed
// Planted fault: letting done items end a sprint with a time box names the first.
test("a time box alone ends a sprint with one; a record outside a team's folder is no sprint", () => {
  const boxed = sprint("team3", "01", { end: "2026-10-25" }), late = sprint("team3", "02", { end: "2026-10-01", selection: ["ITM-009"] });
  const stray = { ...sprint("team3", "03", { end: "2026-10-01" }), path: "docs/backlog/sprints/03.md" };
  const before = JSON.stringify([boxed, late, stray]);
  assert.deepEqual(sprintsToClose([boxed, late, stray], [state("ITM-001", "done"), state("ITM-009", "in progress")], "2026-10-19"), [{ sprint: "team3/02", closer: "ci-bot", because: "time box ended" }]);
  assert.equal(JSON.stringify([boxed, late, stray]), before);
});
