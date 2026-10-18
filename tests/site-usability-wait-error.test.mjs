// A wait of the browser checks that runs out names the last real error of its attempts, and a check that fails prints the tail of the browser
// child's stderr (ITM-938).
// Run: node --test tests/site-usability-wait-error.test.mjs
//
// Module: MOD-site-frame
// Guards: A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
// Level: unit
//
// The cause, from the logs of ITM-935's failures (job 117679158190 of run 39128690464 and job 117705630250 of run 39137748483): "/ is loaded did not
// hold within 30 s; last error: deadline". `until` of tests/site-usability.d/browser.mjs races each attempt against the deadline of the whole wait
// (browser.mjs:31); when the deadline arrives while an attempt is still in flight, the race throws "deadline" and the catch (browser.mjs:33) stores it as
// the last error, over the error that an earlier attempt really gave. And the child's stderr, which openWindow keeps in memory, is written nowhere
// when a check fails after the window was open, so it never reached those logs.
// The tests call `until` with attempts of their own and `withStderr(failure, stderr)` of browser.mjs with a stderr of their own: no browser is started
// (ITM-947's rule counts a file that names the browser's staging step or its lock as a file that starts one; this file names neither, and imports
// only the helpers). Expected results are stated in each case.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { until, withStderr } from "./site-usability.d/browser.mjs";

const FILES = ["site-usability.test.mjs", "site-accessibility.test.mjs"];
const forever = () => new Promise(() => {});

// TST-938001 · level: unit · module: MOD-site-frame
// given: an attempt that throws Error("named failure of the first attempt") once, and whose later attempts never answer
// input: until("the page answers", attempt, 600)
// expect: until rejects at its limit; its message names "named failure of the first attempt" and does not give "deadline" as the last error
test("TST-938001: a wait that runs out while an attempt is in flight names the last real error", { timeout: 10000 }, async () => {
  let tries = 0;
  const attempt = () => (++tries === 1 ? Promise.reject(new Error("named failure of the first attempt")) : forever());
  await assert.rejects(until("the page answers", attempt, 600), (failure) => {
    assert.equal(failure.message.includes("the page answers did not hold within 0.6 s"), true);
    assert.equal(failure.message.includes("last error: named failure of the first attempt"), true);
    assert.equal(failure.message.includes("last error: deadline"), false);
    return true;
  });
});

// TST-938002 · level: unit · module: MOD-site-frame
// given: attempts that never answer and never throw
// input: until("the page answers", attempt, 400)
// expect: until rejects at its limit with "last error: none": the deadline is no error of an attempt (the counter-proof of TST-938001: it fails when "deadline" is taken for one)
test("TST-938002: counter-proof — a wait whose attempts never failed names no error", { timeout: 10000 }, async () => {
  await assert.rejects(until("the page answers", forever, 400), (failure) => {
    assert.equal(failure.message.includes("last error: none"), true);
    assert.equal(failure.message.includes("deadline"), false);
    return true;
  });
});

// TST-938003 · level: unit · module: MOD-site-frame
// given: an attempt that throws Error("named failure of every attempt") at once, every time
// input: until("the page answers", attempt, 400)
// expect: until rejects at its limit; its message names "named failure of every attempt" (the known positive: a failing attempt is named, as it is today)
test("TST-938003: a wait whose attempts all fail names their error", { timeout: 10000 }, async () => {
  await assert.rejects(until("the page answers", () => Promise.reject(new Error("named failure of every attempt")), 400), (failure) => {
    assert.equal(failure.message.includes("last error: named failure of every attempt"), true);
    return true;
  });
});

// TST-938004 · level: unit · module: MOD-site-frame
// given: a failure Error("the first route did not load") and a stderr of 2000 characters that begins "FIRST-LINE" and ends "LAST-LINE"
// input: withStderr(failure, stderr)
// expect: an error whose message holds "the first route did not load" and the end of the stderr, "LAST-LINE", and not its beginning, "FIRST-LINE"
test("TST-938004: a failed check carries the tail of the browser child's stderr", () => {
  const stderr = `FIRST-LINE${"x".repeat(1980)}LAST-LINE`;
  const failed = withStderr(new Error("the first route did not load"), stderr);
  assert.equal(failed instanceof Error, true);
  assert.equal(failed.message.includes("the first route did not load"), true);
  assert.equal(failed.message.includes("LAST-LINE"), true);
  assert.equal(failed.message.includes("FIRST-LINE"), false);
});

// TST-938005 · level: unit · module: MOD-site-frame
// given: a failure and an empty stderr
// input: withStderr(failure, "")
// expect: the message holds the failure's message and says that the child wrote nothing to its stderr, so that an empty stderr is told from a missing one
test("TST-938005: an empty stderr is named as empty", () => {
  const failed = withStderr(new Error("the first route did not load"), "");
  assert.equal(failed.message.includes("the first route did not load"), true);
  assert.equal(failed.message.includes("wrote nothing to its stderr"), true);
});

// TST-938006 · level: unit · module: MOD-site-frame
// given: the text of the two checks
// input: whether each names withStderr
// expect: both do: a check that fails after its window opened passes the child's stderr on through it
test("TST-938006: both checks pass the child's stderr on when they fail", () => {
  const without = FILES.filter((file) => !readFileSync(new URL(`./${file}`, import.meta.url), "utf8").includes("withStderr"));
  assert.deepEqual(without, []);
});
