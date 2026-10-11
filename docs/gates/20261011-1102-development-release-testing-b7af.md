---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: passed
on:
  - b37f7002a63a6b80a89bde816dce925340000426
  - https://github.com/akmaier/agent-m/pull/330
date: 2026-10-11T11:02:29Z
---
# Development → Release testing: ITM-342

**REGISTER**

## Reason

ITM-342 passes on this exact head into `sprint/team2/20` at `de8f5e447bf8f8c1a4154a90f553647af79bb331`. I independently read the current binding inputs, accepted renderer contracts, item, full source and new battery, PR description and commit/diff history, canonical proofs, and relevant original CI checkout, case, failure, restoration and runner evidence. The first published commit was tests only and CI38123951232 was red on missing behavior; the later tests-only boundary and overlap regressions also failed before their corrections. CI38133696458 is green: Node 1,215 passed, zero failed, eight existing TODOs; Python succeeded over 441 cases with five existing skips and five expected failures. Ubuntu jobs took 72 and 50 seconds. All seven new cases name their guarding requirements and module; each current-head source fault failed its named case, exact bytes were restored, and the same case passed. Canonical proofs001–006 retain their earlier head; proof007 names this head. The immutable all-case result is at test-results commit `aeb8428b66c10251d2540bbf3683b7c735051c3b`.

Every changed file is in scope: `src/markdown-render/difference.mjs` supplies contextual differences; `index.mjs` exports the module interfaces; `mermaid.mjs` loads, checks, orders and sanitises diagram rendering; `render.mjs` presents front matter and calls diagram rendering; `vendor/mermaid.min.js`, `vendor/LICENSE.mermaid` and `vendor/README.md` hold the exact local Mermaid copy, licence and provenance. `tests/markdown-render-342.test.mjs` is the new battery naming MOD-markdown-render. Existing tests and expected results, editor behavior and accepted artifacts are unchanged.

The item's Acceptance holds as far as source and tests show: diagrams have readable SVG labels and local markers, resource-bearing diagrams and parse failures yield escaped source with a reason, ordinary prose and the small-DOM fallback remain readable, front matter is a default table or hidden by option, and differences include surrounding context. The observed failure path was concurrent `renderArtifact` fences → shared vendor parser database → overwritten metadata → image-bearing drawing. `renderMermaid` now orders the complete parse → metadata check → draw operation; TST-342007's queue-bypass fault reproduces that drawing-boundary failure and exact restoration passes. This is controlled Node evidence, not a browser-request claim. The earlier rejected gate remains immutable; this decision completes its one ongoing rework. Release, Sprint review, Main and whole-use-case acceptance remain separate decisions.
