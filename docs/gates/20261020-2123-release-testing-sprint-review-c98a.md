---
gate: Release testing → Sprint review
job:
decider: po-opus-c
role: Product Owner
decision: passed
on:
  - 72e4b1e0494ee1eedb5ec6ce0d85d3f9e5bec09f
  - https://github.com/akmaier/agent-m/pull/1242
date: 2026-10-20 21:23 UTC
---
# Release testing → Sprint review: sprint team2/98

**REGISTER**

## Reason

Sprint team2/98, pull request #1242 of `sprint/team2/98` into `main`, on head `72e4b1e0`.

**Which release tests are due.** Of the four selected items, only ITM-587 declares the level `release`. ITM-367 declares
component, ITM-1150 system and ITM-809 unit (`docs/backlog/sprints/team2/98.md`, "Release testing").

**Written by another participant than the implementer** (`docs/process-models/scrum-wip.md:54`; `RELEASE TESTS ARE NOT
WRITTEN BY THE IMPLEMENTER`, SPEC.md:1501-1503).
- ITM-587's release test is `tests/release-uc-014-get-your-own.test.mjs`, TST-587101 to 587110, level `release`.
- developer-sonnet-h wrote it in `a56e885a` (#1241), the only commit on the sprint branch that touches the file. #1241
  states that h implemented none of ITM-587 or ITM-950.
- developer-sonnet-f built ITM-587 (#1237, and its system test #1240). h's other work in this sprint is ITM-367's
  component test (#1229).

**Green on the sprint branch.**
- **Locally**, in a detached worktree at `72e4b1e0`:
  `LC_ALL=C node --test --test-reporter=spec tests/release-uc-014-get-your-own.test.mjs` gives 10 tests, 10 pass,
  0 fail, 0 todo.
- **On #1242's CI.** Run 39499422404, `pull_request` at `72e4b1e0`, passes 23 of 23 jobs on its first attempt.
  - A pull request into `main` runs the release files (`.github/workflows/tests.yml:9-10`, `:113-114`), unlike one into a
    sprint branch.
  - By the workflow's own selection, run on the worktree, the file falls to node (4). The same selection puts
    `tests/release-uc-014-setup-route.test.mjs` in node (5) and `tests/desktop-shell-bridge-jobs.test.mjs` in node (1),
    and both are found there in the log (known positives).
  - node (4)'s job log, read from the jobs API, shows `ok 124` to `ok 133` for the ten cases, and ends with `# tests 293`,
    `# fail 0`, `# cancelled 0`, `# todo 1`.
  - `gh run view --log` cuts node (4)'s log off after 30 cases, so the ten cases are missing there. The jobs API's log
    is complete.

**Every merge is the head its gate passed.**

| Item | Pull request | Gated head | Merged head |
|---|---|---|---|
| ITM-367 | #1229 | `e1fc4d58` | `e1fc4d58` |
| ITM-1150 | #1189 | `8cefcb61` | `10915e16`, which merges `sprint/team2/98` into `8cefcb61`, as the Selection asks |
| ITM-587 | #1237 | `1807ffdb` | `1807ffdb` |
| ITM-809 | #1236 | `89d4cdf3` (second gate) | `b8495f3c`, which merges `sprint/team2/98` into `89d4cdf3` |
| ITM-587, system test | #1240 | `5af2f460` | `5af2f460` |
| ITM-587, release test | #1241 | `a56e885a` | `a56e885a` |

- The first-parent line from `2a8e1a77`, which is on `main`, is these six merges and no direct commit.
- `git show --cc` prints no change for any of them, nor for `10915e16`, `b8495f3c` and `1807ffdb`.
- **No unfinished items.** All four selected items are merged, and 98.md's Unfinished items are empty.
