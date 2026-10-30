---
id: ITM-817
title: A backlog's findings follow the SPEC's module rule and name their own rules
level: module
realises:
  - A BACKLOG ITEM NAMES THE MODULES IT CHANGES
modules:
  - MOD-work-plans
builds_on:
  - ITM-688
tests:
  - unit
origin:
  - ITM-688's gate on pull request #757 (sprint team1/75), from developer-sonnet-e's readings and findings
---
# ITM-817 A backlog's findings follow the SPEC's module rule and name their own rules

**REGISTER**

## Outcome

ITM-688 built `backlogFindings` as `docs/architecture/MOD-work-plans.md:192-194` states it
(`src/work-plans/checks.mjs:37-74`). Read against the SPEC, it leaves two gaps:
- **The module rule.** `A BACKLOG ITEM NAMES THE MODULES IT CHANGES` has as its Check: "an item that names no module, or
  a module the architecture does not describe, is reported" (SPEC.md:1679-1682). Today an item is reported only when none
  of its modules is described, so an item that names MOD-store and a MOD-ghost gets no finding. The release tests of
  ITM-987 met it (sprint team1/123, Review).
- **Circles.** Today only a pair that builds on each other is caught. A circle of three or more is caught by no rule, and
  its items can never start.

## The reading of the accepted text

- An item is reported for every module it names that the architecture does not describe, under `A BACKLOG ITEM NAMES THE
  MODULES IT CHANGES`, as the SPEC's Check says. The module's sentence, "names no module the architecture describes",
  stays true of what is reported; the finding follows the SPEC's rule, which binds the module.
- "builds on one that builds on it in turn" (MOD-work-plans.md:193) is read through any number of items: an item that
  builds on an item that builds, through others, on it. So a circle of any length is reported.
- The rule names of the other findings, and what the old `itemProblems` also checked, are not part of this item.

## Acceptance

- `backlogFindings` reports an item naming one described and one undescribed module, naming the undescribed one, and a
  circle of three items, each item of it named. Counter-proof: each passes on the code as it stands.
- The existing findings and their rule names stay as they are.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
