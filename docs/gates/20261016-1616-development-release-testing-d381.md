---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - ec3290f13b7510f919f5b4439c8e827ebf7ed315
  - https://github.com/akmaier/agent-m/pull/601
date: 2026-10-16 16:16 UTC
---
# Development → Release testing: ITM-509, The main page's list of every job, with the job of this tab's conversation

**REGISTER**

## Reason

ITM-509, pull request #601 into `sprint/team1/47`, at head `ec3290f1`. developer-sonnet-b wrote it, as `47.md` assigns.
It lists the following as read in full: AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `47.md`, MOD-main-page,
MOD-site-frame, MOD-job-ledger, MOD-runtimes, MOD-prompt-bar, MOD-bridge-client, MOD-browser-store, UC-046, UC-049 and
UC-036.

1. **The tests-only commit is red.** `364e7ed6` was pushed alone. Run 38928177734 failed on it, with one failure in node
   (3): the new test file could not load `src/main-page/index.mjs`.
   - Since the red was a missing file, a stub was run without being committed. In that run, TST-509001–006 fail on
     behaviour, and TST-509007, the view's shape, passes by the stub's shape.
   - The listing of `/private/tmp/claude-501/` was the same before and after the work.
2. **CI is green on the head**: run 38930193726. GitHub reports the pull request mergeable.
3. **The changes stay in the item's module.** The new `src/main-page/index.mjs` and `jobs.mjs` (MOD-main-page), and the
   new `tests/main-page-jobs.test.mjs`.
   - `home`, `job`, the refresh interval and `index.html` are untouched, as the cut says.
   - No existing test changes. The whole node suite fails only in the six bridge-build files, identically without
     `src/main-page/`.
   - The test's own `fetch` spy and an outer spy saw no request leave.
4. **The tests state their values, and each fault is caught.** Eight planted faults are each caught.
5. **The Acceptance holds.**
   - Every job of the instance and two fixture products is listed, the waiting ones first, with the row's fields and cost
     "unknown".
   - This tab's running message is listed and is gone once it ends.
   - An unreadable product is named with its reason.
   - An unreachable live state shows its reason.
   - The four filters narrow the rows.
   - The view's strategies are `[sourceStrategies]`.

The readings in the pull request are within the item:
- the instance is connected as a product is, with `github-token`;
- `listJobs` is called a second time with the live states, and the snapshot's cache reads no record twice;
- a `by:` naming a Bridge this browser does not keep gets `liveState`'s own reason;
- the display forms.

## A use the module file did not list

`jobs.mjs` imports MOD-bridge-client's `settingsOf` beside `bridgeAt`. A Bridge kept at a jump host's port, `{ port,
token }`, has no address until `settingsOf` gives one, so the jobs on it would otherwise always be unreachable.
MOD-main-page's `uses:` and Uses list only `bridgeAt`. That is the same gap MOD-prompt-bar's file had, which akmaier
closed by accepting a draft that adds `settingsOf` (`2fcb4a2e`).

A draft of MOD-main-page that adds `MOD-bridge-client.settingsOf` to its uses, for akmaier's acceptance, is committed
with this record. It does not hold the gate: the use is the one the accepted MOD-prompt-bar file already makes for the
same purpose, and the module calls nothing else outside its file.
