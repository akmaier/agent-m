---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - e9a53768b66aa4e2f70a4bb1561f5d86b4e03866
  - https://github.com/akmaier/agent-m/pull/1008
date: 2026-10-19 10:17 UTC
---
# Development → Release testing: ITM-986, rejected — an increment's requirements and tests come from a format no text states

**REGISTER**

## Reason

ITM-986 (MOD-work-plans), pull request #1008 into `sprint/team1/93`, is rejected on `e9a53768`.

**What holds.**
- Two commits, one parent each, with the trailer `developer-sonnet-e`.
- The red is `5362639b`, run 39235470706: `# fail 5`, exactly the five new tests, with `# cancelled 0`.
- `flakyTests` is among MOD-work-plans' uses (MOD-work-plans.md:35).

**What fails.**
- **The output the text asks for.** MOD-work-plans.md:179-184 gives each entry of `sprintFacts`' increment its `realises`
  and `tests`.
- **The inputs it names.** `states`, `jobs`, `results`, `pullRequests` and `issues`. None of them holds an item's
  `realises` or `tests`: an `ItemState` (:132-134) holds the item's identifier, state, job and pull request.
- **What the code does instead.** It reads them from `Realises:` and `Tests:` lines in the merged pull request's body
  (`facts.mjs:42`). No text states that format, and no pull request writes it, so the increment would show empty lists.
- **What has to change.** The accepted text gives no input that holds those facts. So a draft for akmaier is needed: the
  smallest is the backlog items, or the plan's steps, among `sprintFacts`' inputs.

**What passes on the next head.**
- The draft is accepted, and `realises` and `tests` come from the item documents it adds.
- An item is in the increment when its `ItemState` is `done` with its pull request. That is what `states` gives, rather
  than a pull request's name.
- The other readings stand:
  - a job belongs to the sprint when it works on a selected item;
  - the waits are given as counts in text, since gate records hold no resume time;
  - no cost is shown as zero;
  - `issues` is accepted and not read.
