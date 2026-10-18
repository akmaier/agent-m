---
id: ITM-872
title: The graph checks read the repository in batches
level: module
realises:
modules:
  - MOD-job-runner
builds_on:
tests:
  - unit
origin:
  - ITM-735's measurement (sprint team1/84), by developer-sonnet-c
---
# ITM-872 The graph checks read the repository in batches

**REGISTER**

## Outcome

MOD-job-runner's check `graph-checks` (`src/job-runner/builtins.mjs:222-224`) hands `acrossArtifacts` the draft in place as
`{ paths, read }` (`inPlace`). That source drops the snapshot's `readMany`. Measured on this repository with a token, it costs 1,930 requests,
1,928 of them single reads of `/contents`. `traceGraph` over the snapshot itself batches them (22 requests at the same
size). The check hands `traceGraph` the snapshot, or a source that keeps `readMany`, through the interfaces its Uses name. A
committed test counts the requests on a recorded fixture.

## Requirement (open)

No binding sentence asks this yet. `A PAGE LOAD READS THE REPOSITORY IN BATCHES` (SPEC.md:672) speaks of "one load of a
dashboard page", and `graph-checks` runs in a job. MOD-trace-graph's `TextSource` (MOD-trace-graph.md:106-109) offers
`readMany` "where the source offers it", so a source without it breaks no rule. The item is not selectable until akmaier
names the sentence it realises, or accepts a draft for one.

## Acceptance

- `graph-checks` reads the repository in batches of a hundred with a token, and the test pins the count.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
