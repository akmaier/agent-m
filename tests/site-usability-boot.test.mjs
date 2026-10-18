// The boot that tests/site-usability.test.mjs and tests/site-accessibility.test.mjs share waits for a page that does not answer at once (ITM-924).
// Run: node --test tests/site-usability-boot.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; THE SITE SERVES A SCREEN READER; A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// Level: unit
//
// The cause, from the logs of job 117666025638 (failed) and 117666693942 (passed, the rerun) of tests/site-usability.test.mjs: the window
// opened at 12.8 s, and the next evaluation in the page, sent right after `Page.navigate` (routes.mjs `show`, the wait "/ is loaded"), was never
// answered by the DevTools session; the wait gave that one evaluation its whole 30 s, so it could not try again, and the hook ended with
// "Runtime.evaluate was not answered within 30 s". The rerun's same evaluation was answered. So the fix is a short wait for each answer and
// a new evaluation after it, inside the same total time — not a longer wait.
//
// This calls routes.mjs `show` with a page of the test's own whose evaluations after a navigation are lost (as many as the case says) or
// answered at once, or answered slowly, and `show`'s options `answerWithin` (the time one evaluation may take to answer) and `limit` (the total
// time of one wait). Expected results are stated in each case.

import test from "node:test";
import assert from "node:assert/strict";
import { show } from "./site-usability.d/routes.mjs";

// A page: `lost` evaluations after the navigation never answer (they reject when the time they are given, `within`, is over, as
// the session's call does), the later ones answer true for the load and the drawing; `slow` ms is how long an answer takes.
function page({ lost = 0, slow = 0 } = {}) {
  const state = { navigated: false, afterNavigation: 0 };
  return {
    state,
    async call(method) { if (method === "Page.navigate") state.navigated = true; return {}; },
    async evaluate(expression, within = 30000) {
      if (!state.navigated) return "/__blank";
      state.afterNavigation += 1;
      if (state.afterNavigation <= lost) return await new Promise((_, reject) => setTimeout(() => reject(new Error("Runtime.evaluate was not answered")), within));
      if (slow) await new Promise((resolve) => setTimeout(resolve, slow));
      return true;
    },
  };
}
const site = { address: "http://127.0.0.1:1" };

// TST-924001 · level: unit · module: MOD-site-frame
// given: a page whose first two evaluations after the navigation are never answered, the third and later answer
// input: show(page, site, "/", { answerWithin: 100, limit: 5000 })
// expect: show returns, after at least three evaluations after the navigation, the two lost ones retried
test("TST-924001: an evaluation that is never answered is tried again, and the page is then drawn", { timeout: 10000 }, async () => {
  const fake = page({ lost: 2 });
  await show(fake, site, "/", { answerWithin: 100, limit: 5000 });
  assert.ok(fake.state.afterNavigation >= 4, `evaluations after the navigation: ${fake.state.afterNavigation}`);
});

// TST-924002 · level: unit · module: MOD-site-frame
// given: a page whose evaluations after the navigation each take 300 ms to answer
// input: show(page, site, "/", { answerWithin: 2000, limit: 5000 })
// expect: show returns; an answer that is slow but arrives is waited for (the load and the drawing each answered once, no more than a handful of evaluations)
test("TST-924002: an answer that is slow but arrives is waited for", { timeout: 10000 }, async () => {
  const fake = page({ slow: 300 });
  await show(fake, site, "/", { answerWithin: 2000, limit: 5000 });
  assert.ok(fake.state.afterNavigation <= 4, `evaluations after the navigation: ${fake.state.afterNavigation}`);
});

// TST-924003 · level: unit · module: MOD-site-frame
// given: the page of TST-924001, whose first evaluation is lost
// input: show(page, site, "/", { answerWithin: 600, limit: 500 }) — one evaluation is given more time than the whole wait, as before the change
// expect: show rejects with "/ is loaded did not hold within": the counter-proof, a lost evaluation that is given the whole wait is not retried
test("TST-924003: counter-proof — an evaluation given the whole wait is not retried and the wait ends", { timeout: 10000 }, async () => {
  const fake = page({ lost: 1 });
  await assert.rejects(show(fake, site, "/", { answerWithin: 600, limit: 500 }), /\/ is loaded did not hold within/);
});

// TST-924004 · level: unit · module: MOD-site-frame
// given: a page that never answers after the navigation
// input: show(page, site, "/", { answerWithin: 100, limit: 800 })
// expect: show rejects within the limit, naming the address: "/ is loaded did not hold within 0.8 s"
test("TST-924004: a page that never answers ends the wait at its limit and names the address", { timeout: 10000 }, async () => {
  const fake = page({ lost: 1000 });
  const began = Date.now();
  await assert.rejects(show(fake, site, "/", { answerWithin: 100, limit: 800 }), /\/ is loaded did not hold within 0\.8 s/);
  assert.ok(Date.now() - began < 3000, "the wait ended at its limit");
});
