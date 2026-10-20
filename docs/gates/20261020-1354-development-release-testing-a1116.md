---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 92fb59aeabde1bd455ee621bbd0f4a8573bf2959
  - https://github.com/akmaier/agent-m/pull/1215
date: 2026-10-20 13:54 UTC
---
# Development → Release testing: ITM-1116, passed — the live dashboard loads its views as data-views names them

**REGISTER**

## Reason

ITM-1116 (MOD-site-frame), pull request #1215 into `sprint/team1/98`, passes on `92fb59ae`.

- **Three commits, one parent each, no merge, all with the trailer `developer-sonnet-e`.**
  - `722f26be` and `4056cf65` hold only tests: `tests/site-frame-data-views.test.mjs` and the harness
    `tests/app-harness.mjs`.
  - `92fb59ae` changes:
    - `src/site-frame/dashboard-app.mjs`, which imports no page module and loads each view `data-views` names;
    - `docs/index.html`, whose app script names the six views;
    - one existing test.
- **The red:**
  - run 39432752204, job 118661746764 on `722f26be`: `# fail 2`, `# cancelled 0`, exactly tests 343 and 345;
  - run 39433447181, job 118664181394 on `4056cf65`: `# fail 3`, with test 346.
  - TST-1116002, the menu and routes unchanged, guards.
- **The three points, judged:**
  1. `tests/implementation-pages-backlog-wiring.test.mjs` (TST-681102, level `component`) pinned the app's import line
     of `src/site-frame/dashboard-app.mjs`, which is MOD-site-frame's file.
     - The Acceptance says only MOD-site-frame's files and tests change. A test whose subject is a line of
       MOD-site-frame's file is read as one of its tests. The ruling is the Product Owner's, and it is recorded here.
     - It is not a release test, so SPEC.md:1501-1503 does not bind it.
  2. `docs/index.html` is MOD-site-frame's: its text names it among its parts (MOD-site-frame.md:93).
  3. Without `document`, the views are empty, for tests that import the file only for its functions. No test relies on
     a view there.
- **The release tests that pin the built views pass with no change.** The 18 release files that load the live app
  (`app-harness` or `dashboard-app`) were run locally at the head, with a temporary folder of its own and the Bridge's
  packages installed as CI installs them: 156 tests, none failed.
- **CI:** 23 of 23 checks passed on the head (run 39433692936).
- **Merge:** `git merge-tree --write-tree` onto `sprint/team1/98` (`60a29204`) is clean.
- **Replayed in a clean worktree at the head:**
  - The 365 tests of `tests/site-frame*` and `tests/implementation-pages*` pass. That holds with a temporary folder of
    its own; the shared one keeps a stale Electron lock.
  - Counter-proof: with the base's `dashboard-app.mjs` and `index.html`, exactly tests 343, 345 and 346 fail.
