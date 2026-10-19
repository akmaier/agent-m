---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 90dca982560a518a9ce1831bb9a08fc957d45d5d
  - https://github.com/akmaier/agent-m/pull/1083
date: 2026-10-19 14:15 UTC
---
# Release testing → Sprint review: sprint team1/95

**REGISTER**

## Reason

Sprint team1/95, pull request #1083 of `sprint/team1/95` into `main`, on head `90dca982`.

**Every merge is the head its gate passed.**

| Item | Pull request | Gated head |
|---|---|---|
| ITM-676 | #1068 | `33433730` |
| ITM-665 | #1067 | `b8f08411` |
| ITM-656 | #1069 | `3c36bcac` |
| ITM-925 | #1070 | `eb8925ab` |
| ITM-662 | #1074 | `ca01f4cd` |
| ITM-1047 | #1071 | `2db71025` |
| ITM-731 | #1076 | `f76d3400` |
| ITM-671 | #1077 | `4a347f71` |
| ITM-726 | #1078 | `3ced7f64` |
| the release test of UC-024 | #1085 | `e5e0556d` |

- The first-parent line from `42e46da5` is these ten merges and no direct commit.
- `git show --cc` prints nothing for any of them.
- The unfinished items, ITM-655, ITM-696 and ITM-1079, are in 95.md, as the Product Owner decided them.

**The release tests.** Run 39266748388 ran on `90dca982` as a pull request into `main` and passed all twenty jobs.
- **The sixteen node logs** (`end95/<job>.log`, each job's raw log) each end with `# fail 0` and `# cancelled 0`: 4,817
  tests and 47 todos.
  - The todos are the 46 known findings of sprint 94's end gate.
  - One more, TST-905114, is the new route `#arrange/kind=use-cases` with the known finding that every page shares: the
    menu's `aria-required-children`, in `docs/index.html` and `src/site/menu.mjs`.
- **The four python logs** each end with `OK`: 550 tests, with the one known expected failure.
- **The release test that failed on `f12fb7b1` passes:** `ok 101 - release · ITM-129 UC-024: every menu entry and view
  of today is shown` (#1085).
- **The release tests of the Bridge's pages,** run locally at ITM-1047's gate, pass here too, within `# fail 0`.
- **Every job ends within two minutes.** The longest is python (2), at 94 s.
