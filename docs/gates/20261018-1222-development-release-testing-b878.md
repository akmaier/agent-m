---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 4fabb2925257e92dd55b98e6a22d78f767cf1aee
  - https://github.com/akmaier/agent-m/pull/892
date: 2026-10-18 12:22 UTC
---
# Development → Release testing: ITM-878, the Spec page shows the changes waiting for acceptance, then the SPEC

**REGISTER**

## Reason

ITM-878 (MOD-trace-pages, MOD-site-frame), pull request #892 into `sprint/team1/89`, is **rejected on `4fabb292`, for one
release test.** Everything else holds.

**What fails.** `tests/release-sprint-01-dashboard-app.test.mjs:673`, "release · UC-006 4d: an entry waits for the entry that
creates its heading; ticked together both are written in queue order", fails on the head with "the open entries stand in
a first part". I ran it in a clean checkout of the head with the Bridge packages installed as CI does (agreement 83).
- At `:685` it goes to `#spec` and looks for the list's first part, `section.open-changes`.
- Since this item, `#spec` draws the specification, and the list stands at `#spec-entry` (MOD-site-frame.md:149-150).
- With the base's `src/` (`689a634f`) in the same checkout, the file passes: 34 of 34, 2 todo.
- It does not run in CI's node jobs, so the green CI does not show it.

**What passes the gate when it is fixed:**
- The address in that release test changes from `#spec` to `#spec-entry` at `:685`, and at `:739` if it reads the list
  there too. Nothing else changes.
- The change is made by developer-sonnet-b, who builds none of the item (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).
  It is a tests-only commit on #892, quoted in its body, as in sprint 87's UC-006 4d case.

**Held, for the next decision on this pull request:**
- **Red first.** `689a634f` is red in run 39125978681 on exactly the eight named tests.
- **The change** (`1eada88f`) is in `src/trace-pages/flow.mjs` and `src/site-frame/dashboard-app.mjs`, as accepted.
- **TST-597202's change is confirmed** (`tests/system-itm-597-spec-traces.test.mjs:79`, `4fabb292`). Its regular expression
  meant the opened requirement's row. The page now ends with the links to `#spec-entry`, which the expression caught. The
  narrowed form examines that row, with UC-001 as its known positive. It is the item's own output, under `d995c09b`. The
  developer's local pattern missed `system-*` files, which is noted.
- **Green and mergeable.** Run 39126673286 passes all twelve jobs, the slowest 1 min 12 s. `git merge-tree --write-tree`
  merges the head into `sprint/team1/89` without a conflict (tree `997f0f20`).
- **The counter-proofs fail their tests:** the waiting section read at a tag fails TST-597007; the queue read not skipped
  fails TST-878004; "in SPEC" counted as waiting fails TST-878001 and 878002.
- **The requests:** one load of `#spec` on this repository is 7 on base and head (`A PAGE LOAD READS THE REPOSITORY IN
  BATCHES`).
