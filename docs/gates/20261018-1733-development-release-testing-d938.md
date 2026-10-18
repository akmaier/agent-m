---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - a646bea3cc1afe8039c256c81d3c200db5db1cbe
  - https://github.com/akmaier/agent-m/pull/918
date: 2026-10-18 17:33 UTC
---
# Development → Release testing: ITM-938, rejected — a window that fails to open loses its child's stderr, and the message says it wrote nothing

**REGISTER**

## Reason

ITM-938 (MOD-site-frame, test code only), pull request #918 into `sprint/team1/91`, is rejected on `a646bea3`.

**What holds.**
- The participant trailer is on all three commits: `developer-sonnet-e`.
- The red commit is `30b5c82d` (tests only, run 39146962031). `git show --cc` is empty for the merge `aa2da82a`.
- `until` now keeps the last real error.
- CI run 39147381768 passes all twelve jobs. `git merge-tree --write-tree` merges the head into `sprint/team1/91` without a
  conflict (tree `fbfd74bc`).

**What fails: the Acceptance's second half,** "a failed check prints the tail of the Electron child's stderr".
The data-flow path:
1. `tests/site-usability.test.mjs:85` (and its twin in `site-accessibility.test.mjs`) runs
   `browser = await openWindow(...)`.
2. When `openWindow` throws (`browser.mjs:191`, `catch (failure) { close(); throw failure; }`), `browser` is never
   assigned. The child's `stderr`, which `openWindow` holds from `:170`, is dropped with it.
3. The hook then calls `withStderr(failure, browser?.stderr())` with `undefined`. `withStderr` reads that as an empty
   stderr and appends "the Electron child wrote nothing to its stderr".

So for every failure inside `openWindow` (the debugging target, `readyPage`, the address), the stderr is still not
printed, and the message now states something false.

**Measured** (`p938/probe.mjs` in the Product Owner's scratchpad). The probe calls the head's `openWindow` with a stand-in
executable and then the hook's own expression.

| Stand-in child | `openWindow`'s failure | Hook's addition |
|---|---|---|
| writes `PROBE-STDERR-exits` to stderr and exits 3 (the known positive) | "Electron stopped; exit=3; … stderr=PROBE-STDERR-exits" | "the Electron child wrote nothing to its stderr" |
| writes `PROBE-STDERR-alive` to stderr and stays alive | "the window's page appears among the debugging targets did not hold within 30 s; last error: fetch failed" | "the Electron child wrote nothing to its stderr" |

In the second case the child's stderr is not printed at all.

**What passes the gate on the next head:**
- `openWindow`'s own failure carries the tail of the child's stderr. Its catch has the stderr in scope, so it can throw
  `withStderr(failure, stderr)`.
- The hooks add a tail only for a window that opened. Where no child ran, nothing claims that one wrote nothing.
- A test runs `openWindow` with a stand-in executable that writes a named line to its stderr and never serves a page, and
  finds that line in the failure, with a counter-proof. The executable is a shell script that starts no Electron, so it is
  no Electron file under ITM-947's rule.
- This is the same item and the same module. No new item is needed.
