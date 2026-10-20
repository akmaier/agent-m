---
id: ITM-1146
title: Kinds that expect the same answer share one answer schema
level: module
realises:
  - ONE DEFINITION, THREE DRIVERS
modules:
  - MOD-job-catalogue
builds_on:
  - ITM-1133
tests:
  - unit
origin:
  - po-opus-b's second gate of #1175 (ITM-1133), on 52876ec8
---
# ITM-1146 Kinds that expect the same answer share one answer schema

**REGISTER**

## Outcome

SPEC.md:440-444: "The prompts, schemas and job definitions exist exactly once … *Check:* … no prompt or schema text appears
in more than one place." At #1175's gate, four groups of kinds hold byte-identical answer schemas
(`src/job-catalogue/kinds/<kind>/answer.schema.json`):
- change-architecture, change-use-case, derive-architecture and derive-use-cases;
- fix-bug, implement and refactor;
- change-requirements and derive-requirements;
- check-for-persons and review-architecture.

One of them also equals a tool's input schema in `tools.md`. TST-1133005 passes because developer-sonnet-f reads each
kind's answer schema as that kind's own definition. That reading is named in #1175, and the gate did not adopt it as the
SPEC's meaning: a whole schema's text stands in more than one file.

MOD-job-catalogue.md:41 gives every kind its own `kinds/<name>/answer.schema.json`, so stating a shared schema once is a
change of the accepted text.

## Not ready: a draft for akmaier

The draft lets a kind name an answer schema of the catalogue that it shares with others, stated once, instead of a copy in
its folder. It goes to akmaier together with the question this item rests on: whether two kinds that expect the same
answer hold one schema, or two that happen to be equal. If akmaier rules that they are two, this item closes, and the
reading of TST-1133005 is recorded as his.

## Acceptance

- Once the draft is accepted, each answer schema text stands in one file. TST-1133005 then reports any schema whose whole
  text stands twice, with no exemption for answer schemas. A participant other than this item's implementer changes it.
- It is declared as refactoring: no expected result changes, and CI is green on every commit.
