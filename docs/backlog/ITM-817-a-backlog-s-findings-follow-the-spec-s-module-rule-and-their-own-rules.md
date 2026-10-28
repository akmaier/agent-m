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
(`src/work-plans/checks.mjs:37-74`). Read against the SPEC, that
text leaves four gaps:
- **The module rule.** `A BACKLOG ITEM NAMES THE MODULES IT CHANGES` has as its Check: "an item that names no module, or
  a module the architecture does not describe, is reported". The module's sentence, "names no module the architecture
  describes", reports an item only when none of its modules is described. An item that names MOD-store and a MOD-ghost
  gets no finding.
- **Circles.** "builds on one that builds on it in turn" catches a pair. A circle of three or more is caught by no
  rule, and its items can never start.
- **Rule names.** `finding()` requires a requirement's name. No requirement names the soundness of `builds_on` or a
  restated item, so ITM-688 borrowed `THE BACKLOG LIVES IN THE PRODUCT REPOSITORY` and `EXACT DUPLICATES ARE FOUND
  WITHOUT A MODEL`. Neither says it.
- **What the old `itemProblems` also checked:** the path and front-matter form, unknown realised names and a missing
  origin. The old file was removed by `fb51ab2f9`; MOD-documents' `documentFindings` of the item schema now names a
  realised name that is neither a requirement nor a use case and a missing origin (`tests/test_backlog_item_fields.py:9-11`).

So `MOD-work-plans.md`'s sentence, and the requirement names its findings carry, are drafted for akmaier first. Where a
rule needs a SPEC sentence, it is a SPEC draft. This item then builds what is accepted.

## Acceptance

- `backlogFindings` reports what the accepted text says, each finding under a requirement that says it, with tests.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
