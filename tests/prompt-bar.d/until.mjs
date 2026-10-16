// The wait that the prompt bar's and the frame's tests share (tests/prompt-bar.test.mjs, tests/prompt-bar-fixed.test.mjs,
// tests/prompt-bar-hand-over.test.mjs, tests/site-frame-prompt-bar.test.mjs, tests/site-frame-prompt-bar-foot.test.mjs): it checks a
// condition, and while the condition does not hold lets the event loop run one turn (setImmediate), until the condition holds or ten
// seconds of the clock (Date.now) have passed. At the limit it fails "never: <what>", naming what it waited for. Neither Date.now nor
// setImmediate is faked by any of these files: only tests/prompt-bar-hand-over.test.mjs enables mock timers, for setTimeout alone. It is
// test code; it holds no expected result.
//
// Module: MOD-prompt-bar; MOD-site-frame
// Level: unit

import assert from "node:assert/strict";

// tick() -> Promise<void> — one turn of the event loop.
export const tick = () => new Promise((resolve) => setImmediate(resolve));

// until(condition: () => any, what: string, limitMs?: number = 10000) -> Promise<void>
// Resolves as soon as `condition()` is truthy, checked once more at the limit; otherwise fails the test with "never: <what>".
export async function until(condition, what, limitMs = 10000) {
  const limit = Date.now() + limitMs;
  while (Date.now() < limit) { if (condition()) return; await tick(); }
  if (condition()) return;
  assert.fail(`never: ${what}`);
}
