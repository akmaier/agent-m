---
id: ITM-1195
title: MOD-work-plans' Uses line names coverageGaps for what no item realises, which coverageGaps does not give
level: module
realises:
  - DEVELOP AGAINST INTERFACES
modules:
  - MOD-work-plans
builds_on:
tests:
  - unit
origin:
  - the gate of #1318 (ITM-615, sprint team2/105), developer-sonnet-i's reading
---
# ITM-1195 MOD-work-plans' Uses line names coverageGaps for what no item realises, which coverageGaps does not give

**REGISTER**

## Outcome

MOD-work-plans.md's Uses reads (MOD-work-plans.md:310): "MOD-trace-graph.traceGraph, moduleOrder, coverageGaps — the order of modules by their
uses, and what no item realises".
- `coverageGaps` (`src/trace-graph/derive.mjs:156`, MOD-trace-graph.md:219) gives the requirements no use case, module or
  test realises or guards, the use cases that realise no requirement, and the unknown names. It gives nothing about items.
- The recipe `backlog-inputs` (ITM-615, #1318) computes "those no item realises yet" from the existing items' `realises`.
- No code of MOD-work-plans calls `coverageGaps` for it. `traceGraph` is called (`src/work-plans/checks.mjs:140`,
  `src/work-plans/strategies.mjs:51`); whether `moduleOrder` is, is read when the draft is written.

## Not ready: a draft for akmaier

The Uses line is corrected by a draft for akmaier, with the reviewer and the tests that read MOD-work-plans run first.
- It names what the module takes from MOD-trace-graph, and only that.
- "What no item realises" is the module's own work over the items.
- It may be joined with the other stale Uses lines found by then.

## Acceptance

- Once the draft is accepted, MOD-work-plans' Uses names no function for a result that function does not return.
- No code changes.
