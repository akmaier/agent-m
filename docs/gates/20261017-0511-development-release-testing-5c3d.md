---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b138fe5981e8a2aa0e2bfc0d83ce74924c24f103
  - https://github.com/akmaier/agent-m/pull/692
date: 2026-10-17 05:11 UTC
---
# Development → Release testing: ITM-645, UC-047's release test finds the Notifications fold by what it is

**REGISTER**

## Reason

ITM-645, pull request #692 into `sprint/team1/65`, at head `b138fe59`. developer-sonnet-b wrote it, and built none of
ITM-643 (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

**The change** is one line of TST-472513, in `tests/release-sprint-07-uc-047-notifications.test.mjs:312`, as the diff
shows. The fold is found as the Notifications control's direct-child `<details>` whose first child is a `<summary>`
reading exactly *What is this?*. No assertion and no `src` file changed.

**The acceptance, against the Scrum Master's saved local runs:**

| | `sprint/team1/65` (`5880840a`) | ITM-643's head (`6b61dd61`) |
|---|---|---|
| the test before | 10 pass | 9 pass, TST-472513 fails |
| the test after | 10 pass | 10 pass |

- **Counter-proofs.** On each tree, two faults are planted: the fold removed, and the fold without its summary. Each
  fails TST-472513 alone, and each restored tree passes 10 of 10.
- **The red.** No CI red is possible: the change asserts nothing new, and a release test runs on a sprint branch's CI
  only in mode rest. Its red is the run on ITM-643's head, where the old locator fails. The sprint's pull request into
  `main` runs it in mode all.
- **CI and merging.** CI is green, ten of ten, and GitHub reports the pull request mergeable. ITM-018 passes.

**Findings.**
1. **ITM-645 is recorded in `65.md`'s selection** in this commit.
2. **The header "Written by developer-sonnet-e, the release tester" stays.** It states who wrote the file, and that is
   still true. Who changed the locator is in the commit, and AGENTS.md §1 reads: "History belongs in git commit messages
   and version history, not in the files themselves." So no item and no line are needed.
3. **No CI red,** for the reason above.
