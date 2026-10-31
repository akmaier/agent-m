---
id: ITM-1330
title: A sprint that has ended is drawn as ended
level: module
realises:
  - UC-032
  - UC-035
  - A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT
modules:
  - MOD-progress-measures
builds_on:
tests:
  - unit
origin:
  - findings UC032-S7 and UC032-S8 of ITM-803's battery, ruled at its gate (docs/gates/20261030-2035-development-release-testing-d803.md, Noted), and team1's sprint 129 Review (docs/backlog/sprints/team1/129.md)
---
# ITM-1330 A sprint that has ended is drawn as ended

**REGISTER**

## Outcome

UC-032 6b says that a sprint ends "at the end of its time box or, in a sprint without one, when every selected item is
done or the Product Owner presses **End sprint**". `teamSprint` (`src/progress-measures/measures.mjs:116`) takes a
sprint as final only with `## Review` or `end < today`:
- a sprint ended today by *End sprint* is drawn as running (TST-803019);
- a sprint without a time box whose every selected item is done is drawn as running (TST-803020).

MOD-work-plans' `sprintsToClose` decides the same question already: "its `end` date is before or on `today`; or, without a
time box, every item of its selection is `done`, or its record holds `## Ended`".

With this item, `final` and a team's last ended sprint follow that one rule.

## Readiness

It waits for a text.
- MOD-progress-measures' Uses do not name MOD-work-plans' `sprintsToClose` (MOD-progress-measures.md, Uses: `ItemState`,
  `Held`, `itemStates`, `heldItems`, `conflicts`, `undecidedHeads`, `planSchemas`).
- Calling it would break the team's agreement that a module imports nothing its Uses do not name.
- Writing the rule again in `teamSprint` would keep it twice (AGENTS.md §2, "Nothing twice").

The sentence it needs, in MOD-progress-measures' Uses: `MOD-work-plans.sprintsToClose` — whether a team's sprint has
ended. The `final` of `ProgressView` and the `lastEnded` of `BacklogView` are then read by it. That text is akmaier's to
accept. The item is ready once an approval record names MOD-progress-measures' text with it.

## Acceptance

- Unit cases of `progressView` and `backlogView`:
  - a sprint whose `## Ended` is today is final;
  - a sprint without a time box whose every item is done is final;
  - known positive: a sprint whose time box ends tomorrow is not.
- TST-803019's and TST-803020's `todo` are taken away on the item's branch, in a commit of its own, by a participant who
  implemented none of the item.
- The first commit holds only the tests, and CI is red on it for the item's reason.
