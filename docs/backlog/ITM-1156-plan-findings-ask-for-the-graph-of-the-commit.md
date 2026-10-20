---
id: ITM-1156
title: planFindings asks for the graph of the plan's commit
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-work-plans
builds_on:
  - ITM-1120
tests:
  - unit
origin:
  - ITM-1120's gate on pull request #1201 (sprint team1/97), from developer-sonnet-e's finding
---
# ITM-1156 planFindings asks for the graph of the plan's commit

**REGISTER**

## Outcome

Since ITM-1120, the plan page asks for the graph of its commit, so that the stored graph is read. But the page's marks
come from MOD-work-plans' `planFindings`, which builds its own graph from the files: `traceGraph(source)` with no commit
(`src/work-plans/checks.mjs:139`). So the plan page as a whole still reads the files only the graph reads.

**First task:** read whether `planFindings`' accepted signature (MOD-work-plans.md:172) gives it the commit, or the graph.
Where it does not, the item stops for a draft.

## Acceptance

- Over a fake GitHub with the stored graph of the commit on `trace-cache`, the plan page reads no file that only the
  graph reads. Counter-proof: without the stored graph, the graph is built.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
