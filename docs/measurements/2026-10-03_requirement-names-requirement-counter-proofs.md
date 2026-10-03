# A requirement that names another is in its impact list — counter-proofs and suites (ITM-156)

**MESSUNG** — 2026-10-03, branch `team/ITM-156` from `sprint/03` at `37449fc`, tests at `e8cb8cf`, macOS, Node 25.9.0,
Python 3.14.6. CI runs Node 22. developer-opus-d (claude-opus-5-5).

## Path, before and after

`traceability/graph.mjs` `linkGraph(snapshot)` → `parseRequirements(SPEC.md)` → each live requirement becomes a node
`{ kind: "requirement" }` → no edge leaves it → `requirementImpact(graph, "RULE ONE")` → `IMPACT` walks four kinds (use case
via `realises`, decision via `forced_by`, module via `realises`, test via `guards`) → a requirement whose occasion names
`` `RULE ONE` `` is not listed; `coverageGaps(graph).unknownNames` → `graph.unknown`, built only from edges → a withdrawn
requirement that only another requirement still names is not reported.

After: `linkGraph`, once every node is known, reads the rule, occasion and check of each live requirement of the SPEC, takes
every span in backticks, folds its whitespace (a name wrapped over a line, as a Markdown code span is) and draws
`{ from, to, kind: "names" }` to it when the commit holds it as a requirement — a node of kind `requirement`, or a name the SPEC
keeps as withdrawn — and it is not the requirement itself. `IMPACT` gains `["requirement", "names"]`, after the tests; a
withdrawn target has no node and becomes an unknown name with `withdrawn: true` and the naming requirement in `from`, by the
existing code. No other module changed; `requirementImpact(graph, name) -> [artifact]` keeps its shape.

## Suites

| | before (`37449fc`) | tests only (`e8cb8cf`) | after |
|---|---|---|---|
| `node --test tests/*.test.mjs` | 526 — 522 pass, 4 todo | not run (the commit changes two Python files only) | 526 — 522 pass, 4 todo |
| `cd tests && python3 -m unittest` | 367, OK (5 expected failures) | 371, 2 failures (5 expected failures) | 371, OK (5 expected failures) |

CI on `e8cb8cf`: run 37118590676, red in *Python checks* — the two failures are
`test_a_requirement_naming_another_in_backticks_is_in_its_impact_list` and
`test_a_withdrawn_requirement_a_live_one_names_is_reported_with_its_note`; the node step and the SPEC-read step were skipped
after it. The two counter-proof tests pass before the
implementation, as a counter-proof does; each is red on a planted fault below. No expected result of an existing test changed.

## Counter-proofs

Each fault planted in `docs/assets/traceability/graph.mjs`; the four new tests run
(`python3 -m unittest -v` on `test_impact_list.ARequirementNamingARequirement` and the two new cases of
`test_coverage_report.UnrealisedRequirements`); the file restored; after the series it was byte-identical and the four green.
Script: `scratchpad/mutate.py` (not committed).

- N1 `test_a_requirement_naming_another_in_backticks_is_in_its_impact_list`
- N2 `test_counter_proof_a_name_in_prose_itself_or_a_withdrawal_note_is_not_listed`
- N3 `test_a_withdrawn_requirement_a_live_one_names_is_reported_with_its_note`
- N4 `test_counter_proof_a_capitals_word_in_backticks_or_a_name_in_prose_is_no_unknown_name`

| | Planted fault | Red |
|---|---|---|
| F1 | `IMPACT` without `["requirement", "names"]` | N1 |
| F2 | no `names` edge drawn | N1, N3 |
| F3 | a requirement's name anywhere in the text is a reference, backticks or not | N1, N2, N4 |
| F4 | a requirement naming itself draws an edge | N1, N2 |
| F5 | every word in capitals in backticks is a reference, a requirement or not | N4 |
| F6 | a name wrapped over a line is not read (whitespace not folded) | N1, N3 |
| F7 | a withdrawn requirement is no target | N3 |

## The SPEC entry page

Read with `tests/app-harness.mjs` on a scratch fixture (`scratchpad/view-probe.mjs`, not committed): an entry changing RULE ONE,
which UC-001 realises and RULE TWO names in its occasion. The impact section lists UC-001 and RULE TWO — the line for RULE TWO
reads `requirement <a href="#arc/RULE TWO">RULE TWO</a> — names · SPEC.md`: the kind and the edge as the graph names them
(`KIND[a.kind] ?? h(a.kind)`, `VIA[a.via] ?? h(a.via)`), so `dashboard/spec-changes-view.mjs` is unchanged. Its link goes to the
architecture route, the view's default for a kind other than use case and test.

## Agent M's own SPEC

Read with a scratch script (`scratchpad/probe.mjs`, not committed) over `SPEC.md` at `37449fc`: 322 live requirements; 147
backticked references from one live requirement to another, 29 of them wrapped over a line. 19 other words in capitals stand in
backticks (`LICENSE`, `POST`, `FETCH`, `GITHUB_TOKEN`, `INBOX`, …); with every capitals word taken as a reference they would have
been 19 unknown names. None of the backticked names is one of the 11 requirements the SPEC keeps as withdrawn.
