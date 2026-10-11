---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: passed
on:
  - e2ebc685a8d540fd87ebf0ee4aa79c6ce50ec8ee
  - https://github.com/akmaier/agent-m/pull/346
date: 2026-10-11T12:02:45Z
---
# Development → Release testing: independent selected-item release verification

**REGISTER**

## Reason

PR346 passes on this exact head into `sprint/team2/20` at `55a64f2a5455588cd4c23da0c706c5c2abc108b6`. I independently read the original job, selected items and accepted contracts, both complete commits and their changed file, public callers and working fixtures, complete guarded-source author history, current PR description, three canonical counter-proofs and complete decoded proof outputs. Completed original binding/process/use-case and textbook reads remain valid by verified identity. Developer-terra-e implemented none of the guarded behavior: the source history identifies developer-opus-b for the original renderer, developer-terra-a for ITM-342 and developer-terra-b for ITM-343.

Only `tests/markdown-render-release-20.test.mjs` changes: it declares MOD-markdown-render, release level, guards, inputs, preconditions and expectations for TST-342008, TST-342009 and TST-343005. These tests add no behavior, so the release-test exception applies to the first-commit red condition. Original tests-only head `f6ae33ed6a3d695a93ffe276f43dac9b32eca452` and failed CI38136447792 nevertheless remain preserved. The subsequent namespace and wildcard traversal fixture correction follows the existing working SVG fixture, changes no expected result and changes no source. Current CI38136834909 is green on the exact reviewed head: Node 1,240 passed, zero failed, eight existing TODOs; Python succeeded over 441 cases with five existing skips and five expected failures. Ubuntu jobs took 89 and 56 seconds. I reviewed the original checkout pins, relevant case and failure nodes, restoration receipts, totals, status and duration evidence; the complete unchanged raw logs remain retained. The immutable current all-case result is test-results commit `cdb915267d4426a32da41ba9745f8fb8d35df493`, `runs/e2ebc685a8d540fd87ebf0ee4aa79c6ce50ec8ee/20261011-1147-pull-request-0427.md`.

The selected-item Acceptance holds as far as source and tests show. `renderArtifact` displays its default front-matter table, adjacent prose, readable drawn labels and escaped failure source/reason; `showDifference` preserves contextual signed lines; `openEditor` displays marks and draft preview/difference, retains text after refused Save and respects unsaved-discard and saved-close baselines. Each relevant source fault fails its named case at the observed failure node: hidden front matter loses the expected `id` table header, an added row loses its `dadd` class, and reversed draft arguments reverse the expected current/draft signs. All three faults exit 1; byte-exact source restoration matches the original hashes and the same case then exits 0. Canonical proofs TST-342008, TST-342009 and TST-343005 match those complete outputs and exact source/test hashes. This approves only the named Development → Release testing gate for these selected-item tests. Aggregate Sprint review, Main, human artifact acceptance and whole-use-case completion remain separate.
