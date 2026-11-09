// The issues a message of the prompt bar names, read with the page's host and added to the message (UC-049, MOD-prompt-bar's `withIssues`).
// Run: node --test tests/prompt-bar-issues-named.test.mjs
//
// Module: MOD-prompt-bar
// Level: unit
// Guards: UC-049; UC-038
//
// The host is constructed: readIssue answers issue 2 and refuses any other number with NotFound. No network is reached.

import test from "node:test";
import assert from "node:assert/strict";
import { withIssues } from "../src/prompt-bar/send.mjs";

const SHIPS = { number: 2, title: "Add selectable ship types at game start",
  body: "The reporter requests two selectable ships: a slow ship with a shot that can kill up to three enemies, and the regular ship." };
const host = { readIssue: async (number) => { if (number === 2) return SHIPS; throw Object.assign(new Error(`issue #${number} was not found.`), { name: "NotFound" }); } };

// TST-2026110910 · level: unit · module: MOD-prompt-bar
// guards: UC-049; UC-038
// given: a host that holds issue #2 "Add selectable ship types at game start" with its text, and no issue #7
// input: withIssues of "In Alien Invasion: change the requirements as issue #2 asks", of the same naming #2 and #7, and of a message that names no issue
// expect: the first and the second end with a section that holds issue #2's title and its whole text — #7, which the host does not hold, adds nothing —; the third is returned as it is. Counter-proof: the message as it stood reached the participant with the title alone, and Nemotron invented ship properties (akmaier/AlienInvasion, JOB-20261109-2214-2bb1).
test("TST-2026110910: a message that names an issue reaches the participant with the issue's title and text", async () => {
  const named = await withIssues("In Alien Invasion: change the requirements as issue #2 asks", host);
  assert.ok(named.startsWith("In Alien Invasion: change the requirements as issue #2 asks"));
  assert.ok(named.includes(`Issue #2: ${SHIPS.title}`) && named.includes(SHIPS.body), named);
  const two = await withIssues("Do what #2 and #7 ask", host);
  assert.ok(two.includes(SHIPS.body) && !two.includes("Issue #7"), two);
  assert.equal(await withIssues("Group the requirements", host), "Group the requirements");
});
