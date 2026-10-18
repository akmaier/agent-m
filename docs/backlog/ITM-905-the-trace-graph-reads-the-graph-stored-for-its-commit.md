---
id: ITM-905
title: traceGraph reads the graph stored for its commit
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
  - THE TRACEABILITY MATRIX IS DERIVED
  - UC-008
  - UC-023
modules:
  - MOD-trace-graph
  - MOD-repository-hosts
builds_on:
  - ITM-880
tests:
  - unit
origin:
  - akmaier's request of 2026-10-18 to analyse the page loads and precompute the trace once per commit
---
# ITM-905 traceGraph reads the graph stored for its commit

**REGISTER**

## Outcome

Rests on the drafts "DRAFT for akmaier: MOD-trace-graph — the graph of a commit is stored once on the branch trace-cache and
read from there" and "DRAFT for akmaier: MOD-repository-hosts — a snapshot reads a file of another branch in one request".
It starts when akmaier has accepted both.

`Snapshot.readOn(branch, path)` and, in `traceGraph`, the reading of `<commit>.json` on the branch `trace-cache` before any
file is read, with `graphText` and `graphFromText`. A missing branch or file, a text of another format and a text that names
another commit leave the graph to be built as now. On `#arc/<changed module>` with a token this is 39 requests and 19.9 MB
less 22 requests and 12.2 MB (measurement, §4); without a token 2,245 requests become 17.

## Acceptance

- A `TextSource` with `readOn` and a stored text of the commit gives the stored graph and has read no file and called no
  `readMany`; without `readOn`, with no file, with a text that names another commit or with a text that is no graph, the
  graph is built from the files and equals the stored one.
- `graphFromText(graphText(graph), commit)` equals the graph; for another commit it is `null`.
- `Snapshot.readOn` answers one request on GitHub with a token and from the raw host without, `null` for a missing branch
  or file.
- The first commit holds only the tests, and CI is red on it.
