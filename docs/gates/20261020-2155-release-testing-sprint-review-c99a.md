---
gate: Release testing → Sprint review
job:
decider: po-opus-c
role: Product Owner
decision: passed
on:
  - 70e0dfa4d8fb2393e0c4af8974803887ca1d07dd
  - https://github.com/akmaier/agent-m/pull/1251
date: 2026-10-20 21:55 UTC
---
# Release testing → Sprint review: sprint team2/99

**REGISTER**

## Reason

Sprint team2/99, pull request #1251 of `sprint/team2/99` into `main`, on head `70e0dfa4`.

**No release test of a selected item is due.** ITM-864, ITM-655, ITM-798 and ITM-842 each declare `tests: unit`. Every
test file the sprint changes is level `unit`, and no release test changes.

**The release run went back to Development once, and the gated fix returned it.**
- **At `fefff286`, the previous head,** run 39503011452 failed in node (3). The case was ITM-018's release test
  `tests/release-sprint-02-d-traceability.test.mjs:334`, "every edge names an identifier", and the edge was
  `tests/main-page-get-your-own.test.mjs -guards-> UC-014 (step 1)`.
  - The cause is #1244 (ITM-655). Run locally, the case passes at `d5baa103`, the branch just before #1244, and fails at
    `fefff286`.
  - Pull requests into a sprint branch leave release files out (`.github/workflows/tests.yml:9-10`, `:113-114`), so
    #1244's CI could not show it.
- **The reading.** This gate's text (`docs/process-models/scrum-wip.md:54`) names only the release tests of the selected
  items, and none is due. Release testing checks Development (:46), and only Release testing has a way back to Development
  (:37). So this failure counted as Release testing sending ITM-655 back to Development, not as a red merge alone.
- **The fix.** #1252 (developer-sonnet-h, who wrote the test) changes only that file's guards, from `UC-014 (step 1)` to
  `UC-014`. It passed its gate on `353e17e8` (`ff28ecab`).
  - `git diff fefff286 70e0dfa4` changes that one file, 4 lines.
  - `git show --cc 70e0dfa4` prints no change.

**Green on the sprint branch.** Run 39503988355, `pull_request` at `70e0dfa4`, passes 23 of 23 jobs on its first
attempt, release files included.
- node (3)'s log, read from the jobs API, shows `ok 196 - ITM-018 · the graph of this repository's commit: derived, by
  identifier, gaps listed, nothing blocked`. It ends `# tests 347`, `# pass 346`, `# fail 0`, `# cancelled 0`, `# todo 1`.

**Every merge is the head its gate passed.**

| Item | Pull request | Gated head | Merged head |
|---|---|---|---|
| ITM-864 | #1243 | `cca3c51e` | `cca3c51e` |
| ITM-655 | #1244 | `c619bbad` | `c619bbad` |
| ITM-798 | #1245 | `174c3d1f` | `d8d87cfa`, which merges `sprint/team2/99` into it (23 of 23 green) |
| ITM-842 | #1246 | `5be7cb91` | `66a4bf33`, which merges `sprint/team2/99` into it (23 of 23 green) |
| ITM-655, guards fix | #1252 | `353e17e8` | `353e17e8` |

- The first-parent line from `b5203141`, which is on `main`, is these five merges and no direct commit.
- `git show --cc` prints no change for any of them, nor for `d8d87cfa` and `66a4bf33`.
