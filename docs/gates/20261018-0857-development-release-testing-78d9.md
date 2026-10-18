---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - c640da5e2f4db5af1823e95606850561c7a084a5
  - https://github.com/akmaier/agent-m/pull/868
date: 2026-10-18 08:57 UTC
---
# Development → Release testing: ITM-902, the tests that need the SSH package take it from one helper

**REGISTER**

## Reason

ITM-902 (MOD-desktop-shell, MOD-tunnels), pull request #868 into `sprint/team2/89`, passes on `c640da5e`. It is judged
against the item as widened in `2f122643`, and against AGENTS.md §2 and §6a.1.

**The checks:**
1. The red commit `2c5da0e0` holds only `tests/ssh2-fixture.test.mjs`. Run 39112832577 is red on it, and TST-902001
   to 902004 are the four failures.
2. Run 39113052009 is green on `c640da5e`. Its merge commit is `c640da5e` into `851b6957`, which is still the head of
   `sprint/team2/89`.
3. The scope is only test files:
   - the new helper `tests/ssh2-fixture.mjs`, whose header names both modules;
   - its test `tests/ssh2-fixture.test.mjs`, whose header names MOD-desktop-shell;
   - the eleven files the item names. Each changes only how it prepares its fixture.

   The diff checks:
   - No changed line of the eleven files holds `TST-` or `test(`. The same grep finds the `test(` lines of the new
     test.
   - The set of TST identifiers in the eleven files is the same before and after.
   - No `ssh2Cache` line changed, so each file keeps its cache folder.
4. TST-902001 to 902004 name what they guard and their module. Three counter-proofs were replayed on the head, and
   each failed only its own test:
   - the literal `"ssh2@1.17.0"` put back into `tests/tunnels-key.test.mjs` failed 902001;
   - the helper ignoring the staged folder failed 902002;
   - the helper's version check removed failed 902004.
5. The Acceptance holds:
   - `git grep -n '"ssh2@1.17.0"' tests` finds only `tests/ssh2-fixture.mjs:19`. On `851b6957` it found 11 files.
   - The helper takes `src/bridge-build/node_modules` when it holds `ssh2/package.json`, and otherwise the caller's
     cache. It installs only when that cache lacks the package. It checks version `1.17.0`, `Server` and
     `utils.generateKeyPairSync`, and throws when they fail.
   - With an `npm` on PATH that logs each call and fails, and an empty TMPDIR, the eleven files ran on the head: 36
     passed, 1 skipped and 0 npm calls. On `851b6957`, two of the files under the same conditions called
     `npm install … ssh2@1.17.0` and failed.

**The red commit.** The item said that no red first commit applies, because it adds no test. The developer added
four tests anyway. They are in scope: check 3 allows a new test file whose header names an item's module. They
duplicate no test, since nothing tested the setup before. TST-902004 keeps the counter-proof that the Acceptance asks
for, and TST-902001 keeps the Acceptance's grep. The `guards` line of TST-902001, THE BRIDGE CREATES ITS OWN SSH KEY,
is only a loose fit for a grep over test files. This goes to the retrospective.

**The optional second parameter** (`staged`) is used only by the helper's own test. It is one default argument, and
without it TST-902002 to 902004 could not run on a runner that holds the staged package (CI). The only other way would
be to change `src/bridge-build/node_modules` during a test. It is the simplest form that lets the helper be tested,
so it meets KISS and YAGNI.

**The fixed ports.** `tests/tunnels-runtime.test.mjs:110` (42003) and `tests/release-itm-286-tunnels-runtime.test.mjs:83`
(45202) bind fixed ports. Six parallel runs of `tunnels-runtime` failed TST-286003 three times with EADDRINUSE. The
cause is in the test design, from before #868, and it is not in this item's scope. No accepted text is broken
by the code. But several clones run tests at once on one host here, so one commit can both pass and fail these tests:
A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY. The same two files also share the cache folder `agent-m-286-ssh2-1.17.0`,
which ITM-902's outcome says no two files do. That was so before, and the Acceptance's "as before" covers it. No team 1
or existing item covers either point. New item: ITM-903.

**Agreement 83, widened.** `LC_ALL=C`, after `npm install --prefix src/bridge-build --omit=dev --ignore-scripts`, on
the head. The eleven files, `tests/ssh2-fixture.test.mjs` and `tests/release-sprint-02-d-traceability.test.mjs` gave
48 passed, 0 failed and 1 skipped. TST-294001 was skipped because it needs Apache and nginx. The head is branched
from the sprint head, so the head is the merge.
