---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - dc6786255267ddbc2f55d4681cf1c138c2c98f7b
  - https://github.com/akmaier/agent-m/pull/1005
date: 2026-10-19 10:05 UTC
---
# Development → Release testing: ITM-941, rejected — the workflow never makes the branch overview-cache

**REGISTER**

## Reason

ITM-941 (MOD-workflow-entries), pull request #1005 into `sprint/team1/93`, is rejected on `dc678625`.

**What holds.**
- Two commits, one parent each, with the trailer `developer-sonnet-d`.
- The red is `ce2cfec9`, run 39234201471: `# fail 4`, `# todo 0`, `# cancelled 0`.
- The test change inside the code commit `dc678625` only makes the fixture accept MOD-user. The red stands with it: with
  the fixed test file and `ce2cfec9`'s `src/workflow-entries/instance.mjs`, the same 4 tests fail. At the head, all 8 pass.
- `onMainChanged` hands `publishGraph` the files not accepted with their last accepted texts, publishes the overview, and
  ends `failed` naming the step that fails (MOD-workflow-entries.md:200-208). The reading of "that text's commit" as the
  commit that added the approval record stands.

**What fails.**
- `.github/workflows/main-changed.yml` makes and fetches only the branch `trace-cache`.
- `publishOverview` fails with `NotFound` when the repository has no `overview-cache` (MOD-progress-measures.md:234-238).
- So on the instance, `onMainChanged` would end `failed` at every push, and the overview this item stores would never be
  written.
- The workflow file belongs to MOD-workflow-entries, the item's module, so this item changes it.

**What passes on the next head.**
- `main-changed.yml` makes the branch `overview-cache` once and fetches it, as it does `trace-cache`.
- Its comment names the overview, and drops the citation of `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS`, which the
  accepted text (`f2272350`) no longer holds.
- The workflow file's test covers both branches.
