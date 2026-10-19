---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 46729252d15c735666d51c573627e59d922b436f
  - https://github.com/akmaier/agent-m/pull/982
date: 2026-10-19 08:20 UTC
---
# Development → Release testing: ITM-1017, passed — every test names a module, and no list is kept by hand

**REGISTER**

## Reason

ITM-1017 (MOD-test-document), pull request #982 into `sprint/team1/93`, passes on `46729252`.

- **Five commits, one parent each, no merge, each with its trailer:**
  - `6aea0204` and `6341251b`: developer-sonnet-d;
  - `ac83b8ef` and `9ad9803f`: developer-sonnet-b;
  - `46729252`: developer-sonnet-d.
- **The red** is `6aea0204`, tests only (run 39219440410).
- **The release-level headers are changed by a participant who builds none of ITM-1017.**
  - `ac83b8ef` changes exactly the 29 files that `RELEASE_LEVEL_OPEN` named before `46729252`.
  - `9ad9803f` sets `release-itm-290-producers` to MOD-personal-data, as ruled in 93.md.
  - `6341251b`'s two files with "release" in their names (`dashboard-pending-release-report`,
    `test-pages-pending-release-report`) hold unit and component cases, not release ones.
- **The rejection's cause is gone.** `46729252` removes `RELEASE_LEVEL_OPEN`. The check excludes only `tests/fixtures/`.
- **CI:** 20 of 20 jobs passed on the head (run 39221530078). `git merge-tree --write-tree origin/sprint/team1/93 46729252`
  is clean (`89a7280f`).
- **Replayed in a clean worktree at the head:**
  - `tests/trace-graph-module-rows.test.mjs` passes 11 of 11.
  - Counter-proof: with `release-itm-290-producers`' header set to `MOD-documents-nope`, TST-1017001 fails with exactly
    `[code-names-unknown-module, tests/release-itm-290-producers.test.mjs]`.
