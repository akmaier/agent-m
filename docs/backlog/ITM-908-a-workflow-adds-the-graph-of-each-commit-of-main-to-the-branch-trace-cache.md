---
id: ITM-908
title: A workflow adds the graph of each commit of main to the branch trace-cache
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
  - THE TRACEABILITY MATRIX IS DERIVED
modules:
  - MOD-trace-graph
  - MOD-workflow-entries
builds_on:
  - ITM-880
  - ITM-907
tests:
  - unit
origin:
  - akmaier's request of 2026-10-18 to analyse the page loads and precompute the trace once per commit
---
# ITM-908 A workflow adds the graph of each commit of main to the branch trace-cache

**REGISTER**

## Outcome

`publishGraph(host, snapshot)` of the draft "MOD-trace-graph — the graph of a commit is stored once on the branch
trace-cache and read from there", and the workflow that runs it on each push to `main` and adds `<commit>.json` to the
branch `trace-cache`. The work is 0.4 s of `traceGraph` and 6.2 MB of text; the fixed cost of a job around it is about 10 s
(measurement, §4), against a limit of two minutes.

**Settled at ITM-880's gate (po-opus-b): the workflow is written like `apply-approvals.yml`, not generated from the schedule.** `THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE` (SPEC.md:1513) says the CI configuration "is generated from its declared test schedule", and its Check is that "the generated configuration triggers exactly the levels the schedule names for each event". A schedule declares which test levels run on which occasion (MOD-test-schedule.md:49-51). A workflow that writes the graph runs no test level, so the schedule holds nothing it could be generated from. The architecture draws the same line. MOD-test-schedule generates `agent-m-tests.yml` (MOD-test-schedule.md:70). The instance's own workflows belong to MOD-workflow-entries: "one file under `.github/workflows/` runs each of its entries … and does nothing but run it, so that a change between jobs may add it" (MOD-workflow-entries.md:121-124). `apply-approvals.yml` and `fetch-sources.yml` are two such files (MOD-workflow-entries.md:109). So this workflow is one more such file, and it runs an entry of MOD-workflow-entries that calls `publishGraph` on a push to `main`. MOD-workflow-entries' text has no such entry, so the item waits for a draft of MOD-workflow-entries for akmaier, beside the MOD-trace-graph draft. No SPEC change is needed, so the question does not go to akmaier.

**Open before it starts:** the branch's first commit is made once by the workflow (git, orphan) and not by `commitFiles`.

## Acceptance

- `publishGraph` adds `<commit>.json` to the branch head it read, and leaves a file that is there as it is
  (`written: false`); a unit test over a fake host checks both, with a counter-proof that replaces the file.
- A branch that moved meanwhile ends in `Moved`, and the run can be made again.
- The first commit holds only the tests, and CI is red on it.
