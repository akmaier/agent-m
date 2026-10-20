// The identifiers of the tests that tests/site-usability.test.mjs and tests/site-accessibility.test.mjs generate for each route stay as they are when a route is
// added to the table: each route's entry in tests/site-usability.d/routes.mjs holds the numbers of its tests, assigned once, and a new route takes the next
// free numbers (ITM-937).
// Run: node --test tests/site-usability-ids.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; THE SITE SERVES A SCREEN READER
// Level: unit
//
// The cause: both files counted their generated tests with `number++`, so the identifier of a test was the position of its route in the table; a route
// added by MOD-review-pages (#896, ITM-910) shifted the identifier of every test after it. MOD-identifiers states the scheme: `TST-<nnn>`, and "the numbered
// kinds count up; a number or a slug once used stays used". So no identifier is derived from the address; each is a number held with its route
// (`ids`, by series: 904 the look check, 905 the accessibility check) or, for a test that is no route's, in `CASES`.
// This calls routes.mjs `withRoute(table, route)` (a copy with the route at its front, given the next free numbers) and `testId(series, number)`, and reads the
// two files as text for the counter that numbers by position. Expected results are stated in each case.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ROUTES, CASES, testId, withRoute } from "./site-usability.d/routes.mjs";

const ADDED = { address: "#added-first", shows: "Added" };
const FILES = ["site-usability.test.mjs", "site-accessibility.test.mjs"];
// Every number of a series that the table and CASES hold.
const numbersOf = (table, series) => [...Object.values(CASES[series]), ...table.flatMap((route) => Object.values(route.ids[series]))];

// TST-937001 · level: unit · module: MOD-site-frame
// given: the route table, and a copy of it with a route added at its front by withRoute
// input: the numbers of each route of the table in each series, in the table and in the copy
// expect: every route of the table has the same numbers in the copy; the added route has numbers in both series
test("TST-937001: a route added at the front of the table leaves the numbers of every other route unchanged", () => {
  const copy = withRoute(ROUTES, ADDED);
  assert.equal(copy.length, ROUTES.length + 1);
  assert.equal(copy[0].address, ADDED.address);
  const changed = ROUTES.filter((route) => JSON.stringify(copy.find((each) => each.address === route.address).ids) !== JSON.stringify(route.ids)).map((route) => route.address);
  assert.deepEqual(changed, []);
  for (const series of [904, 905]) assert.equal(Object.keys(copy[0].ids[series]).length > 0, true);
});

// TST-937002 · level: unit · module: MOD-site-frame
// given: the same two tables
// input: the numbering by position that the files used (`TST-904` and a number counted from the position of the route)
// expect: the numbering by position gives another identifier to every route of the table in the copy (the counter-proof of TST-937001: that check would find it)
test("TST-937002: counter-proof — numbering by position changes the identifiers of the routes after an added route", () => {
  const byPosition = (table) => new Map(table.map((route, index) => [route.address, `TST-904${String(index + 2).padStart(3, "0")}`]));
  const before = byPosition(ROUTES), after = byPosition([ADDED, ...ROUTES]);
  const changed = [...before].filter(([address, id]) => after.get(address) !== id).map(([address]) => address);
  assert.equal(changed.length, ROUTES.length);
});

// TST-937003 · level: unit · module: MOD-site-frame
// given: the numbers that the table and CASES hold
// input: all numbers of each series
// expect: each is a positive whole number, none is used twice in its series, and testId writes it as `TST-` with the series and the number in at least three digits
test("TST-937003: no number is used twice in a series, and an identifier is TST- with the series and the number", () => {
  for (const series of [904, 905]) {
    const numbers = numbersOf(ROUTES, series);
    assert.equal(numbers.every((number) => Number.isInteger(number) && number > 0), true);
    assert.equal(new Set(numbers).size, numbers.length);
    assert.equal(numbers.every((number) => new RegExp(`^TST-${series}[0-9]{3,}$`).test(testId(series, number))), true);
  }
  assert.equal(testId(904, 2), "TST-904002");
  assert.equal(testId(905, 111), "TST-905111");
});

// TST-937004 · level: unit · module: MOD-site-frame
// given: the text of the two files
// input: the lines with a counter (`number++`)
// expect: none in either file: each generated test takes its identifier from the table or CASES
test("TST-937004: neither check numbers its generated tests by a counter", () => {
  const counted = FILES.flatMap((file) => readFileSync(new URL(`./${file}`, import.meta.url), "utf8").split("\n")
    .filter((line) => /number\+\+/.test(line)).map((line) => `${file}: ${line.trim().slice(0, 60)}`));
  assert.deepEqual(counted, []);
});

// TST-937005 · level: unit · module: MOD-site-frame
// given: the route table, and a copy with a route added by withRoute, and a second copy with another route added to the first
// input: the numbers of the added route in each series, and the highest number of the series before it
// expect: the added route's numbers are the whole numbers right above the highest of the series, one for each check; the second route's are right above those
test("TST-937005: a new route counts up from the highest number of each series", () => {
  const first = withRoute(ROUTES, ADDED), second = withRoute(first, { address: "#added-second", shows: "Second" });
  for (const series of [904, 905]) {
    const highest = Math.max(...numbersOf(ROUTES, series));
    const mine = Object.values(first[0].ids[series]);
    assert.deepEqual(mine, mine.map((_, index) => highest + 1 + index));
    const top = Math.max(...numbersOf(first, series));
    const next = Object.values(second[0].ids[series]);
    assert.deepEqual(next, next.map((_, index) => top + 1 + index));
  }
});

// TST-937006 · level: unit · module: MOD-site-frame
// given: identifiers that documents cite: TST-904054 and TST-904072 (the width checks of #arc and #module), TST-905001 (the main page drawn), TST-904168 and 904169 (the difference box of #uc/UC-001 and #review/uc), TST-905109 to 905111 (the changed use case's keyboard, rule and planted box)
// input: the table and CASES
// expect: each identifier names the same test as before: the number the table or CASES holds for it
test("TST-937006: the identifiers that documents cite name the tests they named", () => {
  const route = (address) => ROUTES.find((each) => each.address === address);
  assert.equal(testId(904, route("#arc").ids[904].widths), "TST-904054");
  assert.equal(testId(904, route("#module").ids[904].widths), "TST-904072");
  assert.equal(testId(905, route("/").ids[905].drawn), "TST-905001");
  assert.equal(testId(904, route("#uc/UC-001").ids[904].box), "TST-904168");
  assert.equal(testId(904, route("#review/uc").ids[904].box), "TST-904169");
  assert.deepEqual([CASES[905].changedKeyboard, CASES[905].changedRule, CASES[905].plantedDiff], [109, 110, 111]);
  assert.equal(testId(904, CASES[904].routes), "TST-904001");
});
