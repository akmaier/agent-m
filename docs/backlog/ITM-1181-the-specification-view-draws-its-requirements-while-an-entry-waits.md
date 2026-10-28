---
id: ITM-1181
title: The specification view draws its requirements while an entry of a change queue waits
level: module
realises:
  - UC-020
  - NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT
modules:
  - MOD-trace-pages
builds_on:
tests:
  - unit
origin:
  - 1eea71a3, which withdrew the queue docs/spec-freigaben/2026-10-22_edits-of-akmaier because the requirements stopped loading with it open; akmaier, 2026-10-22, "fixed so the queue can come back"
---
# ITM-1181 The specification view draws its requirements while an entry of a change queue waits

**REGISTER**

## Outcome

With an open entry in a change queue, the Requirements page draws no requirement. `1eea71a3` withdrew the open queue
`docs/spec-freigaben/2026-10-22_edits-of-akmaier` to bring the page back. SPEC changes cannot go through their queue
while that holds.

**The commit's own finding** (`1eea71a3`):
- the view waits for `entryView`'s impact computation, and with it the whole trace graph, before it inserts its first
  requirement rows;
- a pending-graph comparison gives an empty target only with an open proposal, and releasing that graph restores the
  requirement.

**The path, read on `main`:** `src/trace-pages/flow.mjs:549-567` (`arrangement`, awaited at `:915`) awaits `entryView(...).impact` for each
waiting entry before the tree is drawn. Since `c2e6e5c1` that impact reads the graph stored for the commit (MOD-spec-changes'
Uses: `MOD-trace-graph.storedGraph`), one read of `<commit>.json.gz`, and builds none; a graph not stored rejects with
`GraphNotStored`, which `arrangement` takes as no view (`.catch(() => null)`, `flow.mjs:556`). Since `dcf0badd` the
route takes the waiting queues from the stored overview.

**First task:** confirm that path as the data-flow path of the empty page, with the run that shows it (AGENTS.md §2),
before any change.
- MOD-trace-pages' specification row (MOD-trace-pages.md:131) shows the waiting entries first, and each requirement with
  its status, among them *change proposed* and *removal proposed*.
- So the tree may not wait on what an entry's impact does not need, and a requirement is drawn whatever the impact's
  state.
- Where the text does not settle when the statuses appear, the item stops for a draft.
- Where the page no longer empties on today's code, the item stops and reports that run, since then nothing is to be
  built.

## Acceptance

- With a fixture queue holding one open entry, the specification view draws every requirement of the SPEC, and marks
  the one the entry changes as *change proposed*. Counter-proof: the fault of `1eea71a3`'s finding, the tree awaiting the
  entries' impact lists, fails it.
- The queue `2026-10-22_edits-of-akmaier`, restored from `git show 1eea71a3^`, no longer empties the page. That is shown
  on a fixture, not on `main`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
