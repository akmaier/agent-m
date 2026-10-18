---
id: ITM-905
title: A workflow adds the graph of each commit of main to the branch trace-cache
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
  - THE TRACEABILITY MATRIX IS DERIVED
modules:
  - MOD-trace-graph
builds_on:
  - ITM-880
  - ITM-904
tests:
  - unit
origin:
  - akmaier's request of 2026-10-18 to analyse the page loads and precompute the trace once per commit
---
# ITM-905 A workflow adds the graph of each commit of main to the branch trace-cache

**REGISTER**

## Outcome

`publishGraph(host, snapshot)` of the draft "MOD-trace-graph — the graph of a commit is stored once on the branch
trace-cache and read from there", and the workflow that runs it on each push to `main` and adds `<commit>.json` to the
branch `trace-cache`. The work is 0.4 s of `traceGraph` and 6.2 MB of text; the fixed cost of a job around it is about 10 s
(measurement, §4), against a limit of two minutes.

**Open before it starts** (measurement, §6): whether `THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE` covers this
workflow or it is written like `apply-approvals.yml`; the branch's first commit is made once by the workflow (git, orphan)
and not by `commitFiles`.

## Acceptance

- `publishGraph` adds `<commit>.json` to the branch head it read, and leaves a file that is there as it is
  (`written: false`); a unit test over a fake host checks both, with a counter-proof that replaces the file.
- A branch that moved meanwhile ends in `Moved`, and the run can be made again.
- The first commit holds only the tests, and CI is red on it.
