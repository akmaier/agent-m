---
id: ITM-493
title: A tab job's context, and a job in the tab without a record
level: module
realises:
  - UC-049
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
modules:
  - MOD-runtimes
builds_on:
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-runtimes, Interfaces: tabContext, runOnTab
---
# ITM-493 A tab job's context, and a job in the tab without a record

**REGISTER**

## Outcome

MOD-runtimes' `tabContext` builds the `JobContext` of a job that runs in this tab from what its caller has read,
making no request; `runOnTab` takes `record: null` for a conversation of the prompt bar and then appends nothing
anywhere.

## Acceptance

- `tabContext` gives the context its module file states, `instance.checkout` `null`, with no request made.
- `runOnTab` with `record: null` runs a fixture job to its result and writes nothing; with a record it appends as
  before.
