// The identifiers of the tests that tests/site-usability.test.mjs and tests/site-accessibility.test.mjs generate for each route name the route and the check,
// not the position of the route in the table, so that a route added to the table leaves every other identifier as it was (ITM-937).
// Run: node --test tests/site-usability-ids.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; THE SITE SERVES A SCREEN READER
// Level: unit
//
// The cause: both files counted their generated tests with `number++`, so the identifier of a test was the position of its route in
// tests/site-usability.d/routes.mjs; a route added by MOD-review-pages (#896, ITM-910) shifted the identifier of every test after it.
// This calls `testId(series, ...key)` of routes.mjs with the keys the files use, on the table as it is and on a copy with a route added at its front,
// and reads the two files as text for the counter that numbers by position. Expected results are stated in each case.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ROUTES, testId } from "./site-usability.d/routes.mjs";

const CHECKS = ["drawn", "sheets", "targets", "widths", "diagrams", "wcag", "box"];
const idsOf = (table, series) => new Map(table.flatMap((route) => CHECKS.map((check) => [`${route.address} ${check}`, testId(series, route.address, check)])));
const ADDED = { address: "#added-first", shows: "Added" };
const FILES = ["site-usability.test.mjs", "site-accessibility.test.mjs"];

// TST-937001 · level: unit · module: MOD-site-frame
// given: the route table, and a copy of it with a route added at its front
// input: testId for each route and each check, for series 904 and 905, over both
// expect: every identifier of the table is the same in the copy; the added route's are new
test("TST-937001: a route added at the front of the table leaves every other identifier unchanged", () => {
  for (const series of [904, 905]) {
    const before = idsOf(ROUTES, series), after = idsOf([ADDED, ...ROUTES], series);
    const changed = [...before].filter(([key, id]) => after.get(key) !== id).map(([key]) => key);
    assert.deepEqual(changed, []);
    const added = CHECKS.map((check) => after.get(`${ADDED.address} ${check}`));
    assert.equal(added.every((id) => typeof id === "string" && ![...before.values()].includes(id)), true);
  }
});

// TST-937002 · level: unit · module: MOD-site-frame
// given: the same two tables
// input: the numbering by position that the files used (`TST-904` and a number counted from the position of the route)
// expect: the numbering by position gives another identifier to the routes after the added one (the counter-proof of TST-937001: that check would find it)
test("TST-937002: counter-proof — numbering by position changes the identifiers of the routes after an added route", () => {
  const byPosition = (table) => new Map(table.map((route, index) => [route.address, `TST-904${String(index + 2).padStart(3, "0")}`]));
  const before = byPosition(ROUTES), after = byPosition([ADDED, ...ROUTES]);
  const changed = [...before].filter(([address, id]) => after.get(address) !== id).map(([address]) => address);
  assert.equal(changed.length, ROUTES.length);
});

// TST-937003 · level: unit · module: MOD-site-frame
// given: the routes and the checks, and the keys of the cases that are no route's
// input: testId for each, for series 904 and 905
// expect: each identifier is `TST-` and the series and nine digits; no two keys of one series share an identifier
test("TST-937003: the identifiers are TST-, the series and nine digits, and no two keys of a series share one", () => {
  for (const series of [904, 905]) {
    const ids = [...idsOf(ROUTES, series).values(), testId(series, "planted", "table"), testId(series, "planted", "button"), testId(series, "planted-diagram", "after")];
    assert.equal(ids.every((id) => new RegExp(`^TST-${series}[0-9]{9}$`).test(id)), true);
    assert.equal(new Set(ids).size, ids.length);
  }
});

// TST-937004 · level: unit · module: MOD-site-frame
// given: the text of the two files
// input: the lines that name a test with the series `TST-904` or `TST-905` followed by a counter (`number++`)
// expect: none in either file: each generated test takes its identifier from testId
test("TST-937004: neither check numbers its generated tests by a counter", () => {
  const counted = FILES.flatMap((file) => readFileSync(new URL(`./${file}`, import.meta.url), "utf8").split("\n")
    .filter((line) => /number\+\+/.test(line)).map((line) => `${file}: ${line.trim().slice(0, 60)}`));
  assert.deepEqual(counted, []);
});
