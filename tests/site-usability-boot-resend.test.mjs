// The boot that tests/site-usability.test.mjs and tests/site-accessibility.test.mjs share sends again every call that is not answered, within the
// same total wait: the navigation of a route, the setup of the window's page and the commands the checks set before the first route is drawn.
// Run: node --test tests/site-usability-boot-resend.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; THE SITE SERVES A SCREEN READER; A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// Level: unit
//
// The cause, from the log of job 117687254017 (failed; run 39131435264) of tests/site-usability.test.mjs: the line "the window is open" was
// written at 13:25:34.954 and the hook failed at 13:26:05.006, 30.05 s later, with "Page.navigate was not answered within 30 s". So the
// navigation of the first route, "/", was sent within 51 ms of the window's opening, after the page had answered the evaluation that asks where
// it is, and was never answered. `show` sent it once with the session's whole 30 s (routes.mjs `page.call("Page.navigate", ...)`), so one lost
// answer used the whole wait and could not be sent again. The saved log does not show whether the navigation ran, so these tests cover both: a
// command that is lost, and an answer that is lost after the command ran. The evaluations of `show` are covered by tests/site-usability-boot.test.mjs.
//
// This calls routes.mjs `show` and browser.mjs `readyPage` and `configure` with a page of the test's own whose first calls of a method are not
// answered (they reject when the time they are given, `within`, is over, as the session's call does), and the options `answerWithin` (the time
// one call may take to answer) and `limit` (the total time of one wait). Expected results are stated in each case.

import test from "node:test";
import assert from "node:assert/strict";
import * as browser from "./site-usability.d/browser.mjs";
import * as routes from "./site-usability.d/routes.mjs";

// A page: the first `drop[method]` calls of a method are never answered; `drop.evaluate` is the number of first evaluations never answered.
// With `performed`, a dropped Page.navigate has been carried out although its answer is lost. A call takes `slow` ms to answer.
// After a navigation every evaluation answers true; before it, the page is "/__blank".
function page({ drop = {}, performed = false, slow = 0 } = {}) {
  const state = { navigated: false, sent: {}, evaluations: 0 };
  const lost = (within) => new Promise((_, reject) => setTimeout(() => reject(new Error("was not answered")), within));
  return {
    state,
    async call(method, params, within = 30000) {
      state.sent[method] = (state.sent[method] ?? 0) + 1;
      if (state.sent[method] <= (drop[method] ?? 0)) {
        if (performed && method === "Page.navigate") state.navigated = true;
        return await lost(within);
      }
      if (slow) await new Promise((resolve) => setTimeout(resolve, slow));
      if (method === "Page.navigate") state.navigated = true;
      return {};
    },
    async evaluate(expression, within = 30000) {
      state.evaluations += 1;
      if (state.evaluations <= (drop.evaluate ?? 0)) return await lost(within);
      return state.navigated ? true : "/__blank";
    },
  };
}
const site = { address: "http://127.0.0.1:1" };

// TST-930001 · level: unit · module: MOD-site-frame
// given: a page whose first Page.navigate is never answered and was not carried out
// input: show(page, site, "/", { answerWithin: 100, limit: 5000 })
// expect: show returns, with the page navigated; Page.navigate was sent exactly twice, the lost one and its resend
test("TST-930001: a Page.navigate that is not answered is sent again, and the page is then drawn", { timeout: 10000 }, async () => {
  const fake = page({ drop: { "Page.navigate": 1 } });
  await routes.show(fake, site, "/", { answerWithin: 100, limit: 5000 });
  assert.equal(fake.state.navigated, true);
  assert.equal(fake.state.sent["Page.navigate"], 2);
});

// TST-930002 · level: unit · module: MOD-site-frame
// given: a page whose first Page.navigate was carried out but whose answer is lost
// input: show(page, site, "/", { answerWithin: 100, limit: 5000 })
// expect: show returns, with the page navigated; Page.navigate was sent exactly twice (the resend is harmless: it asks for the same address)
test("TST-930002: a Page.navigate whose answer is lost after it ran is sent again, and the page is then drawn", { timeout: 10000 }, async () => {
  const fake = page({ drop: { "Page.navigate": 1 }, performed: true });
  await routes.show(fake, site, "/", { answerWithin: 100, limit: 5000 });
  assert.equal(fake.state.navigated, true);
  assert.equal(fake.state.sent["Page.navigate"], 2);
});

// TST-930003 · level: unit · module: MOD-site-frame
// given: a page whose Page.navigate takes 300 ms to answer
// input: show(page, site, "/", { answerWithin: 2000, limit: 5000 })
// expect: show returns; Page.navigate was sent exactly once: an answer that is slow but arrives is waited for
test("TST-930003: a Page.navigate that is answered slowly is waited for and not sent again", { timeout: 10000 }, async () => {
  const fake = page({ slow: 300 });
  await routes.show(fake, site, "/", { answerWithin: 2000, limit: 5000 });
  assert.equal(fake.state.sent["Page.navigate"], 1);
});

// TST-930004 · level: unit · module: MOD-site-frame
// given: the page of TST-930001, whose first Page.navigate is lost
// input: show(page, site, "/", { answerWithin: 600, limit: 500 }) — one call is given more time than the whole wait, as before the change
// expect: show rejects with "/ is loaded did not hold within 0.5 s": the counter-proof, a lost Page.navigate that is given the whole wait is not sent again
test("TST-930004: counter-proof — a Page.navigate given the whole wait is not sent again and the wait ends", { timeout: 10000 }, async () => {
  const fake = page({ drop: { "Page.navigate": 1 } });
  await assert.rejects(routes.show(fake, site, "/", { answerWithin: 600, limit: 500 }), /\/ is loaded did not hold within 0\.5 s/);
  assert.equal(fake.state.sent["Page.navigate"], 1);
});

// TST-930005 · level: unit · module: MOD-site-frame
// given: a page that never answers a Page.navigate
// input: show(page, site, "/", { answerWithin: 100, limit: 800 })
// expect: show rejects within 3 s, naming the address: "/ is loaded did not hold within 0.8 s"; the total wait is the limit, not a longer one
test("TST-930005: a Page.navigate that is never answered ends the wait at its limit and names the address", { timeout: 10000 }, async () => {
  const fake = page({ drop: { "Page.navigate": 1000 } });
  const began = Date.now();
  await assert.rejects(routes.show(fake, site, "/", { answerWithin: 100, limit: 800 }), /\/ is loaded did not hold within 0\.8 s/);
  assert.ok(Date.now() - began < 3000, "the wait ended at its limit");
});

// The commands the boot sets before the first route is drawn: the page domain of the window, and what each check sets in the window.
// TST-930006 · level: unit · module: MOD-site-frame
// given: a page whose first call of the method is never answered, for each of Page.enable, Page.addScriptToEvaluateOnNewDocument and Emulation.setDeviceMetricsOverride
// input: configure(page, method, {}, { answerWithin: 100, limit: 5000 })
// expect: configure returns the answer {}; the method was sent exactly twice
for (const method of ["Page.enable", "Page.addScriptToEvaluateOnNewDocument", "Emulation.setDeviceMetricsOverride"]) {
  test(`TST-930006: ${method} that is not answered is sent again`, { timeout: 10000 }, async () => {
    const fake = page({ drop: { [method]: 1 } });
    assert.deepEqual(await browser.configure(fake, method, {}, { answerWithin: 100, limit: 5000 }), {});
    assert.equal(fake.state.sent[method], 2);
  });
}

// TST-930007 · level: unit · module: MOD-site-frame
// given: the page of TST-930006 whose first Page.addScriptToEvaluateOnNewDocument is lost
// input: configure(page, "Page.addScriptToEvaluateOnNewDocument", {}, { answerWithin: 600, limit: 500 })
// expect: configure rejects with "Page.addScriptToEvaluateOnNewDocument is answered did not hold within 0.5 s": the counter-proof, no resend
test("TST-930007: counter-proof — a setup command given the whole wait is not sent again and the wait ends", { timeout: 10000 }, async () => {
  const fake = page({ drop: { "Page.addScriptToEvaluateOnNewDocument": 1 } });
  await assert.rejects(browser.configure(fake, "Page.addScriptToEvaluateOnNewDocument", {}, { answerWithin: 600, limit: 500 }),
    /Page\.addScriptToEvaluateOnNewDocument is answered did not hold within 0\.5 s/);
  assert.equal(fake.state.sent["Page.addScriptToEvaluateOnNewDocument"], 1);
});

// TST-930008 · level: unit · module: MOD-site-frame
// given: a page whose first Page.enable is never answered and whose first evaluation is never answered
// input: readyPage(page, { answerWithin: 100, limit: 5000 }) — the setup of the window's page that openWindow runs after the session opens
// expect: readyPage returns; Page.enable was sent exactly twice and the evaluation of the open document exactly twice
test("TST-930008: the setup of the window's page sends its enabling and its first evaluation again", { timeout: 10000 }, async () => {
  const fake = page({ drop: { "Page.enable": 1, evaluate: 1 } });
  await browser.readyPage(fake, { answerWithin: 100, limit: 5000 });
  assert.equal(fake.state.sent["Page.enable"], 2);
  assert.equal(fake.state.evaluations, 2);
});

// TST-930009 · level: unit · module: MOD-site-frame
// given: a page whose first Page.enable is lost
// input: readyPage(page, { answerWithin: 600, limit: 500 })
// expect: readyPage rejects with "Page.enable is answered did not hold within 0.5 s": the counter-proof, no resend
test("TST-930009: counter-proof — the enabling given the whole wait is not sent again and the wait ends", { timeout: 10000 }, async () => {
  const fake = page({ drop: { "Page.enable": 1 } });
  await assert.rejects(browser.readyPage(fake, { answerWithin: 600, limit: 500 }), /Page\.enable is answered did not hold within 0\.5 s/);
  assert.equal(fake.state.sent["Page.enable"], 1);
});
