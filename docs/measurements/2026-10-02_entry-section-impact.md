# An entry that leaves a requirement out of its section touches it — counter-proofs (ITM-018, finding D1)

**MESSUNG** — 2026-10-02, branch `team/ITM-018-d1` from `sprint/02` at `5957157`, tests at `ac541ed`, macOS, Node 25.9.0,
Python 3.14.6. CI runs Node 22. developer-opus-d (claude-opus-5-5).

Finding D1 of ITM-145 (`docs/measurements/2026-10-02_release-tests-sprint-02-d.md`), the graph's half, sent back to Development
by the Product Owner (`docs/backlog/sprints/sprint-02.md`, *Decided on 2026-10-02*). An open queue entry replaces its section
byte for byte (UC-006 step 6); a live requirement of that section the entry no longer states — renamed in place, or left out —
leaves the SPEC when the entry is accepted, but `linkGraph` drew no `proposes` edge to it, so no impact list could be shown
beside it (`A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST`).

## Path, before and after

`traceability/graph.mjs` `linkGraph` → `isQueueEntry(path)` → `parseRequirements(text(path))` — only the names the entry
states → a name of the replaced section that the entry does not state gets no edge. Measured on the fixture of case 24
(`tests/release-sprint-02-d-traceability.test.mjs`), entry `01-title.md` for `## 2. Title page`: before, `tracesTo(g,
TITLE).proposals` is `[]` for TITLE renamed in place and for TITLE left out (case 24 red). After: the graph reads the queue's
`index.md` among the files (`parseQueueIndex`), builds the queue's entries from it and from the entry files of the same queue,
and asks `sectionForEntry` for the SPEC section the entry replaces; every live requirement of that section the entry does not
state gets `{ kind: "proposes", change: "withdraw" }` — for case 24 `[{ entry: …/01-title.md, change: "withdraw" }]` in both
variants (case 24 green). `linkGraph(snapshot)`'s interface is unchanged: the index is one more file in `files`.

## Suites

| | before (`5957157`) | tests only (`ac541ed`) | after |
|---|---|---|---|
| `node --test tests/*.test.mjs` | 494 tests — 479 pass, 15 todo | 494 — 479 pass, 1 fail, 14 todo | 494 — 480 pass, 14 todo |
| `cd tests && python3 -m unittest` | 361, OK (6 expected failures) | 364, 3 failures (6 expected failures) | 364, OK (6 expected failures) |

On `ac541ed` the node failure is case 24, its mark removed; the Python failures are the two cases of
`tests/test_impact_list.py` that expect an edge, and `test_release_sprint_02_c` *no node test opens Agent M's own SPEC*, which
runs the node suite and so is red while the node suite is. The third new case — the counter-proof, nothing is guessed — passes
on the graph of before, as it must. CI on `ac541ed`: runs 36939213050 and 36939244670, both red. The remaining 14 `todo` cases
are other findings' marks, unchanged — among them case 18 of `tests/release-sprint-02-d-dashboard-app.test.mjs` (ITM-134, next).
No expected result of another test changed.

## Counter-proofs

Each fault planted in `docs/assets/traceability/graph.mjs`, `python3 -m unittest -v test_impact_list` and
`node --test tests/release-sprint-02-d-traceability.test.mjs` run, the file restored; after the series it was byte-identical.
Script: `scratchpad/itm018d1-developer-opus-d/mutate.txt` (not committed). T1–T3 are the three new cases of
`tests/test_impact_list.py` (class `AnEntryThatLeavesARequirementOutOfItsSection`): T1 a requirement renamed in place is touched
as a withdrawal; T2 the section is the one the index names, not the entry's first line; T3 the counter-proof — without the
queue's own index, with an anchor the SPEC lacks, or for an applied entry, nothing is guessed.

| | Planted fault | Red |
|---|---|---|
| M1 | no edge for a requirement the entry leaves out of its section | T1, T2, case 24 |
| M2 | a requirement left out is touched as a change, not a withdrawal | T1, T2 (case 24 accepts either) |
| M3 | the section is read at the entry's first line, never at the index's anchor | T2, T3 |
| M4 | the section is read without the queue's index | T3 |
| M5 | any queue's index counts as the entry's own | T3 |
| M6 | an anchor the SPEC does not hold falls back to the entry's first line | T3 |
| M7 | an applied entry still withdraws what it leaves out | T3; also `test_counter_proof_what_does_not_name_it_is_not_listed` and case 19 |
| M8 | a requirement the SPEC keeps as withdrawn counts as live | T1 |

## Readings

1. **Withdraw, not change.** A live requirement of the replaced section that the entry does not state is touched as
   `"withdraw"`, whether it was renamed in place or left out. A rename cannot be told from a withdrawal plus an addition
   without guessing at similarity; and accepting either entry takes the old name out of the SPEC — which the SPEC itself calls a
   withdrawal plus an addition (`A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED`). The new name stays an `"add"`, as before.
2. **An entry its index does not list** is read at its own first line — the line where the approval engine finds an entry's
   text once it is written (`writtenAnchor`, `deriveSpecStatus`). Case 24's fixture has an `index.md` without a table; this
   reading is what lets its expectation hold unchanged. Without the queue's own `index.md` among the files, the graph behaves
   as before (T3); an index row's anchor wins over the first line (T2).
3. **"Live"** is a requirement the SPEC holds without a withdrawal note; a name the section keeps as withdrawn gets no edge
   (M8), and names another entry of the queue would first create are not the SPEC's and get none either.
4. **An anchor the SPEC does not hold** — and no entry of the queue creates — names no section: no edge, no fallback (T3, M6).

## What ITM-134 calls

`linkGraph({ files, status })` as before, with `files` holding `SPEC.md`, the entry, **the queue's `index.md`**, and — where the
entry's anchor is created by another entry of the queue — that entry's file too; then `tracesTo(graph, name).proposals` or the
`proposes` edges from the entry with `change` `"withdraw"`, and `requirementImpact(graph, name)` for the list.

## Module file

MOD-traceability's `uses` names `MOD-review-core.deriveStatus` and `deriveSpecStatus`, not `parseQueueIndex` or
`sectionForEntry`, which the graph now calls; MOD-review-core's `provides` does not list them either. A module-file gap
(ARC-020 decision 6), reported, not changed here (`docs/process.md`, *Boundary*).
