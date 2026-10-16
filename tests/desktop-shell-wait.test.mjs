// Tests of the wait helper that the desktop shell's native Electron tests share (tests/desktop-shell.d/wait.mjs): a wait ends at
// a deadline in time, whatever each try takes, and says what it waited for. The helper is test code; it holds no product code.
//
// Module: MOD-desktop-shell
// Guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
// Level: unit

import assert from "node:assert/strict";
import test, { mock } from "node:test";
import { wait } from "./desktop-shell.d/wait.mjs";

const never = () => new Promise(() => {});

// TST-276007 · level: unit · module: MOD-desktop-shell
// guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
// given: a condition whose every try throws the error "probe refused", and a deadline of 1000 ms
// input: wait for the condition under the name "the planted condition"
// expect: the wait rejects between 900 ms and 2500 ms after it began, with a message that begins "the planted condition did not hold within 1 s" and contains "probe refused"
test("TST-276007: a condition that never holds ends the wait at the deadline, naming the condition and the last error", async () => {
  const started = Date.now();
  await assert.rejects(
    () => wait("the planted condition", async () => { throw new Error("probe refused"); }, () => {}, 1000),
    (failure) => {
      assert.match(failure.message, /^the planted condition did not hold within 1 s/);
      assert.match(failure.message, /probe refused/);
      return true;
    },
  );
  const elapsed = Date.now() - started;
  assert.ok(elapsed >= 900 && elapsed <= 2500, `ended after ${elapsed} ms`);
});

// TST-276008 · level: unit · module: MOD-desktop-shell
// guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
// given: a condition whose every try never answers, as a CDP evaluation of a stopped main process does, and a deadline of 1000 ms
// input: wait for the condition under the name "the stopped main process"
// expect: the wait rejects between 900 ms and 2500 ms after it began, with a message that begins "the stopped main process did not hold within 1 s"
test("TST-276008: a try that never answers does not outlast the deadline", async () => {
  const started = Date.now();
  await assert.rejects(
    () => wait("the stopped main process", never, () => {}, 1000),
    (failure) => { assert.match(failure.message, /^the stopped main process did not hold within 1 s/); return true; },
  );
  const elapsed = Date.now() - started;
  assert.ok(elapsed >= 900 && elapsed <= 2500, `ended after ${elapsed} ms`);
});

// TST-276009 · level: unit · module: MOD-desktop-shell
// guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
// given: a condition that throws on its first two tries, answers false on its third and answers "ready" on its fourth
// input: wait for the condition under a name, with the default deadline
// expect: the wait resolves "ready" after exactly four tries
test("TST-276009: a condition that holds on a later try returns its value", async () => {
  let tries = 0;
  const value = await wait("the later condition", async () => { tries += 1; if (tries < 3) throw new Error("not yet"); return tries === 3 ? false : "ready"; });
  assert.equal(value, "ready");
  assert.equal(tries, 4);
});

// TST-276010 · level: unit · module: MOD-desktop-shell
// guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
// given: a check that the process is still alive, which throws "Electron exited=1", and a condition that never holds
// input: wait for the condition with that check
// expect: the wait rejects with the check's error "Electron exited=1" on the first try, not with the deadline's message
test("TST-276010: a failing liveness check ends the wait with its own error", async () => {
  await assert.rejects(
    () => wait("the page", async () => false, () => { throw new Error("Electron exited=1"); }),
    (failure) => { assert.equal(failure.message, "Electron exited=1"); return true; },
  );
});

// TST-276011 · level: unit · module: MOD-desktop-shell
// guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
// given: the clock and the timers stopped under the test's control, and a condition that never holds
// input: wait for the condition under the name "the default deadline" without a deadline of its own, and advance the clock by 125 ms until the wait ends
// expect: the wait rejects with a message that begins "the default deadline did not hold within 30 s", after 30000 ms of the stopped clock and before 30500 ms
test("TST-276011: the default deadline is 30 seconds", async () => {
  mock.timers.enable({ apis: ["setTimeout", "Date"] });
  try {
    let message = null;
    const ended = wait("the default deadline", async () => false).catch((failure) => { message = failure.message; });
    let elapsed = 0;
    while (message === null && elapsed < 60000) {
      for (let turn = 0; turn < 10; turn += 1) await Promise.resolve();
      mock.timers.tick(125);
      elapsed += 125;
    }
    await ended;
    assert.match(message ?? "", /^the default deadline did not hold within 30 s/);
    assert.ok(elapsed >= 30000 && elapsed < 30500, `ended after ${elapsed} ms of the stopped clock`);
  } finally { mock.timers.reset(); }
});
