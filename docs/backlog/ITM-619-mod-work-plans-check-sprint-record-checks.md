---
id: ITM-619
title: MOD-work-plans' check sprint-record-checks
level: module
realises:
  - UC-041
  - AN AGENT'S REVIEW NAMES WHERE ITS FEEDBACK CAME FROM
  - AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF
modules:
  - MOD-work-plans
builds_on:
  - ITM-610
tests:
  - unit
origin:
  - the cut of ITM-610 at sprint team1/56: MOD-work-plans' workStrategies, one strategy per item
---
# ITM-619 MOD-work-plans' check sprint-record-checks

**REGISTER**

## Outcome

The check `sprint-record-checks` — an agent's review that does not name the sources of its feedback, or does not say that no stakeholder took part when none did; a retrospective without an entry; a change to the process written as applied rather than proposed — as MOD-work-plans' file states it.
It adds its strategy to `workStrategies`, which ITM-610 builds and registers, and changes no registration. With it, `close-sprint` comes closer to being prepared without `UnknownStrategy`.

**Not ready for a sprint yet.** Its readings are settled before it is selected: the functions it calls are read against MOD-work-plans' Uses; the tests of every input and output form it changes are grepped; every path it builds is checked to be reachable through the real host.

## Acceptance

- The strategy works as MOD-work-plans' file states it, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

## Ready: the readings, settled by the Product Owner (AGENTS.md §6a.6, 2026-10-19)

No text needs to change. The check reads the draft of a `close-sprint` job, which has the shape of MOD-work-plans'
`closeSprint` `close` (`review: { feedback, tookPart, sources }`, `retrospective: [{ text, kind, goes }]`, MOD-work-plans.md:222-227).
A `close-sprint` job is always an agent's, so every draft it checks is an agent's review (UC-041 1a). Its findings, each
an error naming its rule:
1. `review.sources` null or empty — `AN AGENT'S REVIEW NAMES WHERE ITS FEEDBACK CAME FROM`.
2. **Who took part.**
   - Each name in `review.tookPart` must be one whose feedback the review recorded, in a feedback line or among `sources`.
   - An empty `tookPart` passes only when a feedback line says that no stakeholder took part.
   - This is UC-041 1a's "stating that no stakeholder took part unless their feedback is recorded somewhere it read" — same
     rule.
3. `retrospective` empty — a retrospective without an entry.
4. **Process changes stay proposals** — `AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF`.
   - An entry of kind `change` without `goes` is an error. `closeSprint` writes an entry with `goes` as "change, to <goes>",
     a proposal to where it goes.
   - So is a draft that holds any key outside the shape of `close`, such as a file to write: nothing of the process may be
     written by the draft itself.
Each with a counter-proof. Its builds_on, ITM-610, is done.
