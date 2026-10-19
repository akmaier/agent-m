---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - c1360bc7247f0c4e038ab025be06190e7fcc0b57
  - https://github.com/akmaier/agent-m/pull/995
date: 2026-10-19 09:29 UTC
---
# Development → Release testing: ITM-1030, passed — Move and Remove list the jobs and tests that name a resource

**REGISTER**

## Reason

ITM-1030 (MOD-resource-list, MOD-settings-pages), pull request #995 into `sprint/team1/93`, passes on `c1360bc7`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-c`.**
  - `2cfd626f` holds only tests, in two test files.
  - `c1360bc7` holds the code, in `src/resource-list/` and `src/settings-pages/resources.mjs`.
- **The red:** run 39230006257 of `2cfd626f` alone, through the CI-only draft #996, each job with `# todo 0` and
  `# cancelled 0`:
  - node (11): `# fail 4`, exactly the four `namedBy` tests;
  - node (2): `# fail 1`, exactly "resources — Remove and a newer state list the jobs and tests that name the resource".
- **The code meets MOD-resource-list.md:114-117.**
  - `namedBy(snapshot, name)` gives the job records whose `inputs` pin `<name>@<pin>`, and the test files that name the
    resource as a whole word. It changes nothing.
  - The resources page lists both on *Move* and *Remove* and writes nothing.
- **CI:** run 39229651257 passed 20 of 20 jobs on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`80c78936`) is clean.
- **Replayed in a clean worktree at the head:**
  - `resource-list-named-by` and `settings-pages-resources` pass 19 of 19.
  - Counter-proof: with an input matched by the name's prefix instead of `<name>@`, `resource-list-named-by` fails 1.
