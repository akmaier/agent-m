---
id: ITM-679
title: UC-014's release test reads Step A's two folds
level: system
realises:
  - UC-014
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-settings-pages
builds_on:
tests:
  - release
origin:
  - the start of sprint team1/70 (docs/backlog/sprints/team1/70.md), under sprint 68's agreement on release tests an item changes
---
# ITM-679 UC-014's release test reads Step A's two folds

**REGISTER**

## Outcome

UC-014 gives Step A two folds. Step 7 has "A folded **Why these?** says what each is for", and the closing line has "Both
steps carry a folded *What is this?* for people new to GitHub". TST-627006
(`tests/release-uc-014-setup-route.test.mjs:150-165`) reads the closing line as "each step holds exactly one details …
whose summary reads 'What is this?'". That word "exactly" is not in the use case, and it holds only while Step A lacks
its *Why these?*. ITM-628 adds that fold.

So the test asks of each step one folded *What is this?* among its folds, and of Step A also a folded *Why these?*
whose body names the permissions. A participant who builds none of ITM-628 changes it, before ITM-628's gate (sprint
68's agreement), in the pattern of ITM-645 and ITM-664.

## Acceptance

- TST-627006 asks each step for one folded *What is this?* among its folds, and Step A also for a folded *Why these?*.
  Before ITM-628 its *Why these?* part is a todo naming ITM-628, and with ITM-628 it passes.
- It is written by a participant who builds none of ITM-628.
- Its counter-proof: Step A without its *What is this?* fails it.

**Extended before its gate (2026-10-17, po-opus).** TST-627004 in the same file asserts one fold in Step A
(`foldedIn(stepA).length === 1`, :131) and reads the permissions from `folded[0]`. With ITM-628's second fold it fails.
UC-014 step 7 asks "A folded **Why these?** says what each is for", not that there be one fold. So TST-627004 finds,
among Step A's folds, the folded one whose text names the six permissions with their purposes. It neither counts the
folds nor relies on their order, and its expected purposes are unchanged.
- It passes before ITM-628, where `setup-key`'s *What is this?* holds the list, and after it, where *Why these?* does.
- Its counter-proof: Step A without the permissions in any fold fails it.
- developer-sonnet-b changes it in pull request #717, building none of ITM-628.
